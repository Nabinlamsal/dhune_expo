import Input from "@/components/ui/Input";
import { useActiveCategories } from "@/hooks/catalog/useCategory";
import { useCreateRequest } from "@/hooks/orders/useRequest";
import { Category } from "@/types/catalog/category";
import { PricingUnit } from "@/types/catalog/category-enums";
import { PaymentMethod } from "@/types/orders/orders-enums";
import { CreateRequestPayload } from "@/types/orders/requests";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

type ServiceItemField = {
    id: string;
    name: string;
    pieces: string;
};

type ServiceForm = {
    id: string;
    category_id: string;
    selected_unit: PricingUnit | "";
    quantity_value: string;
    sqft: string;
    description: string;
    items: ServiceItemField[];
};
type PickupRangeKey = "EARLY" | "MORNING" | "AFTERNOON" | "EVENING";

const PAYMENT_OPTIONS: PaymentMethod[] = ["CASH", "ONLINE"];

const UNIT_LABELS: Record<PricingUnit, string> = {
    KG: "Kilogram",
    ITEMS: "Item-based",
    SQFT: "Square Feet",
};
const DEFAULT_REGION: Region = {
    latitude: 27.7172,
    longitude: 85.324,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};
const PICKUP_RANGES: {
    key: PickupRangeKey;
    label: string;
    startHour: number;
    endHour: number;
}[] = [
    { key: "EARLY", label: "8:00 AM - 10:00 AM", startHour: 8, endHour: 10 },
    { key: "MORNING", label: "10:00 AM - 12:00 PM", startHour: 10, endHour: 12 },
    { key: "AFTERNOON", label: "1:00 PM - 3:00 PM", startHour: 13, endHour: 15 },
    { key: "EVENING", label: "4:00 PM - 6:00 PM", startHour: 16, endHour: 18 },
];

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyItem = (): ServiceItemField => ({
    id: newId(),
    name: "",
    pieces: "",
});

const createEmptyService = (): ServiceForm => ({
    id: newId(),
    category_id: "",
    selected_unit: "",
    quantity_value: "",
    sqft: "",
    description: "",
    items: [createEmptyItem()],
});

const toNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateLabel = (value: Date) =>
    value.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const buildDateWithHour = (datePart: Date, hour: number) => {
    const value = new Date(datePart);
    value.setHours(hour, 0, 0, 0);
    return value;
};

export default function CreateRequestScreen() {
    const router = useRouter();

    const { data: categories = [], isLoading: isLoadingCategories } = useActiveCategories();
    const createRequestMutation = useCreateRequest();

    const [pickupAddress, setPickupAddress] = useState("");
    const [pickupLat, setPickupLat] = useState<number | null>(null);
    const [pickupLng, setPickupLng] = useState<number | null>(null);
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [pickupDate, setPickupDate] = useState(new Date());
    const [pickupRange, setPickupRange] = useState<PickupRangeKey>("MORNING");
    const [activePicker, setActivePicker] = useState<"date" | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [services, setServices] = useState<ServiceForm[]>([createEmptyService()]);
    const [openCategoryFor, setOpenCategoryFor] = useState<string | null>(null);

    const categoryMap = useMemo(() => {
        const map = new Map<string, Category>();
        categories.forEach((category) => map.set(category.id, category));
        return map;
    }, [categories]);

    const updateAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
        try {
            const geocoded = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            const first = geocoded[0];
            if (!first) return;

            const parts = [first.name, first.street, first.city, first.region, first.country].filter(
                (part) => typeof part === "string" && part.trim().length > 0
            );
            if (parts.length > 0) {
                setPickupAddress(parts.join(", "));
            }
        } catch {
            // Keep manual address if reverse geocoding fails.
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const initLocation = async () => {
            setIsLoadingLocation(true);
            try {
                const permission = await Location.requestForegroundPermissionsAsync();
                if (permission.status !== "granted") {
                    Alert.alert(
                        "Location access denied",
                        "You can still choose location by dragging the marker on the map."
                    );
                    return;
                }

                const current = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                if (!mounted) return;

                const lat = current.coords.latitude;
                const lng = current.coords.longitude;
                setPickupLat(lat);
                setPickupLng(lng);
                setRegion((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                void updateAddressFromCoordinates(lat, lng);
            } catch {
                Alert.alert("Location unavailable", "Could not detect current location.");
            } finally {
                if (mounted) setIsLoadingLocation(false);
            }
        };

        void initLocation();

        return () => {
            mounted = false;
        };
    }, [updateAddressFromCoordinates]);

    const setCoordinates = useCallback(
        (lat: number, lng: number) => {
            setPickupLat(lat);
            setPickupLng(lng);
            setRegion((prev) => ({ ...prev, latitude: lat, longitude: lng }));
            void updateAddressFromCoordinates(lat, lng);
        },
        [updateAddressFromCoordinates]
    );

    const updateService = (serviceId: string, patch: Partial<ServiceForm>) => {
        setServices((current) =>
            current.map((service) =>
                service.id === serviceId
                    ? {
                          ...service,
                          ...patch,
                      }
                    : service
            )
        );
    };

    const addService = () => {
        setServices((current) => [...current, createEmptyService()]);
    };

    const removeService = (serviceId: string) => {
        setServices((current) => {
            if (current.length === 1) return current;
            return current.filter((service) => service.id !== serviceId);
        });
    };

    const addItemRow = (serviceId: string) => {
        setServices((current) =>
            current.map((service) =>
                service.id === serviceId
                    ? {
                          ...service,
                          items: [...service.items, createEmptyItem()],
                      }
                    : service
            )
        );
    };

    const removeItemRow = (serviceId: string, itemId: string) => {
        setServices((current) =>
            current.map((service) => {
                if (service.id !== serviceId) return service;
                if (service.items.length === 1) return service;
                return {
                    ...service,
                    items: service.items.filter((item) => item.id !== itemId),
                };
            })
        );
    };

    const updateItemRow = (serviceId: string, itemId: string, patch: Partial<ServiceItemField>) => {
        setServices((current) =>
            current.map((service) => {
                if (service.id !== serviceId) return service;
                return {
                    ...service,
                    items: service.items.map((item) =>
                        item.id === itemId
                            ? {
                                  ...item,
                                  ...patch,
                              }
                            : item
                    ),
                };
            })
        );
    };

    const validateAndBuildPayload = (): CreateRequestPayload | null => {
        if (!pickupAddress.trim()) {
            Alert.alert("Missing field", "Pickup address is required.");
            return null;
        }

        if (pickupLat == null || pickupLng == null) {
            Alert.alert("Missing location", "Please pick a location on the map.");
            return null;
        }

        const selectedRange = PICKUP_RANGES.find((range) => range.key === pickupRange)!;
        const fromDateTime = buildDateWithHour(pickupDate, selectedRange.startHour);
        const toDateTime = buildDateWithHour(pickupDate, selectedRange.endHour);

        if (fromDateTime.getTime() >= toDateTime.getTime()) {
            Alert.alert("Invalid time range", "Pickup time from must be earlier than pickup time to.");
            return null;
        }

        const payloadServices = services.map((service, index) => {
            if (!service.category_id) {
                throw new Error(`Select a category for service #${index + 1}.`);
            }

            if (!service.selected_unit) {
                throw new Error(`Select a unit for service #${index + 1}.`);
            }

            if (service.selected_unit === "ITEMS") {
                const items = service.items
                    .map((item) => ({
                        item_name: item.name.trim(),
                        pieces: toNumber(item.pieces),
                    }))
                    .filter((item) => item.item_name.length > 0 && item.pieces > 0);

                const totalPieces = items.reduce((sum, item) => sum + item.pieces, 0);

                if (items.length === 0 || totalPieces <= 0) {
                    throw new Error(`Add at least one valid item row for service #${index + 1}.`);
                }

                return {
                    category_id: service.category_id,
                    selected_unit: service.selected_unit,
                    quantity_value: totalPieces,
                    description: service.description.trim() || undefined,
                    items_json: {
                        items,
                        total_pieces: totalPieces,
                    },
                };
            }

            if (service.selected_unit === "SQFT") {
                const sqft = toNumber(service.sqft);
                if (sqft <= 0) {
                    throw new Error(`Total SQFT must be greater than 0 for service #${index + 1}.`);
                }

                return {
                    category_id: service.category_id,
                    selected_unit: service.selected_unit,
                    quantity_value: sqft,
                    description: service.description.trim() || undefined,
                    items_json: {
                        total_sqft: sqft,
                    },
                };
            }

            const quantity = toNumber(service.quantity_value);
            if (quantity <= 0) {
                throw new Error(`Quantity must be greater than 0 for service #${index + 1}.`);
            }

            return {
                category_id: service.category_id,
                selected_unit: service.selected_unit,
                quantity_value: quantity,
                description: service.description.trim() || undefined,
            };
        });

        return {
            pickup_address: pickupAddress.trim(),
            pickup_lat: pickupLat,
            pickup_lng: pickupLng,
            pickup_time_from: fromDateTime.toISOString(),
            pickup_time_to: toDateTime.toISOString(),
            payment_method: paymentMethod,
            services: payloadServices,
        };
    };

    const handleCreateRequest = async () => {
        try {
            const payload = validateAndBuildPayload();
            if (!payload) return;

            await createRequestMutation.mutateAsync(payload);
            Alert.alert("Request created", "Your request was submitted successfully.");

            setPaymentMethod("CASH");
            setServices([createEmptyService()]);

            router.replace("/(tabs)/requests");
        } catch (error: any) {
            Alert.alert("Could not create request", error?.message ?? "Please try again.");
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Create Request</Text>
                <Text style={styles.subtitle}>Services first, then pickup details, then payment.</Text>

                <View style={styles.servicesHeader}>
                    <Text style={styles.sectionTitle}>Services</Text>
                    <Pressable style={styles.addServiceBtn} onPress={addService}>
                        <Ionicons name="add" size={16} color="#040947" />
                        <Text style={styles.addServiceText}>Add Category</Text>
                    </Pressable>
                </View>

                {services.map((service, index) => {
                    const selectedCategory = categoryMap.get(service.category_id);
                    const unitOptions = selectedCategory?.allowed_units ?? [];

                    return (
                        <View key={service.id} style={[styles.card, styles.serviceCard]}>
                            <View style={styles.serviceTopRow}>
                                <Text style={styles.serviceTitle}>Service #{index + 1}</Text>
                                <Pressable
                                    onPress={() => removeService(service.id)}
                                    disabled={services.length === 1}
                                    style={[styles.removeBtn, services.length === 1 && styles.removeBtnDisabled]}
                                >
                                    <Text style={styles.removeText}>Remove</Text>
                                </Pressable>
                            </View>

                            <Text style={styles.fieldLabel}>Category</Text>
                            {isLoadingCategories ? (
                                <Text style={styles.hint}>Loading categories...</Text>
                            ) : categories.length === 0 ? (
                                <Text style={styles.hint}>No active categories available.</Text>
                            ) : (
                                <View>
                                    <Pressable
                                        style={styles.dropdownTrigger}
                                        onPress={() =>
                                            setOpenCategoryFor((current) =>
                                                current === service.id ? null : service.id
                                            )
                                        }
                                    >
                                        <Text style={styles.dropdownTriggerText}>
                                            {selectedCategory?.name ?? "Select a category"}
                                        </Text>
                                        <Ionicons
                                            name={openCategoryFor === service.id ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color="#040947"
                                        />
                                    </Pressable>

                                    {openCategoryFor === service.id && (
                                        <View style={styles.dropdownMenu}>
                                            {categories.map((category) => {
                                                const active = service.category_id === category.id;
                                                return (
                                                    <Pressable
                                                        key={category.id}
                                                        style={[
                                                            styles.dropdownOption,
                                                            active && styles.dropdownOptionActive,
                                                        ]}
                                                        onPress={() => {
                                                            const defaultUnit = category.allowed_units[0] ?? "";
                                                            updateService(service.id, {
                                                                category_id: category.id,
                                                                selected_unit: defaultUnit,
                                                                quantity_value: "",
                                                                sqft: "",
                                                                items: [createEmptyItem()],
                                                            });
                                                            setOpenCategoryFor(null);
                                                        }}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.dropdownOptionText,
                                                                active && styles.dropdownOptionTextActive,
                                                            ]}
                                                        >
                                                            {category.name}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    )}

                                    {!!selectedCategory?.description?.trim() && (
                                        <Text style={styles.categoryDescription}>
                                            {selectedCategory.description}
                                        </Text>
                                    )}
                                </View>
                            )}

                            <Text style={styles.fieldLabel}>Service Unit</Text>
                            {service.category_id ? (
                                unitOptions.length === 0 ? (
                                    <Text style={styles.hint}>No units configured for this category.</Text>
                                ) : (
                                    <View style={styles.chipRow}>
                                        {unitOptions.map((unit) => {
                                            const active = service.selected_unit === unit;
                                            return (
                                                <Pressable
                                                    key={unit}
                                                    style={[styles.unitChip, active && styles.unitChipActive]}
                                                    onPress={() =>
                                                        updateService(service.id, {
                                                            selected_unit: unit,
                                                            quantity_value: "",
                                                            sqft: "",
                                                            items: [createEmptyItem()],
                                                        })
                                                    }
                                                >
                                                    <Text
                                                        style={[styles.unitChipText, active && styles.unitChipTextActive]}
                                                    >
                                                        {UNIT_LABELS[unit]}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )
                            ) : (
                                <Text style={styles.hint}>Select a category first.</Text>
                            )}

                            {service.selected_unit === "KG" && (
                                <>
                                    <Text style={styles.fieldLabel}>Quantity (KG)</Text>
                                    <Input
                                        keyboardType="decimal-pad"
                                        value={service.quantity_value}
                                        onChangeText={(value) =>
                                            updateService(service.id, { quantity_value: value })
                                        }
                                        placeholder="e.g. 12"
                                    />
                                </>
                            )}

                            {service.selected_unit === "SQFT" && (
                                <>
                                    <Text style={styles.fieldLabel}>Total SQFT</Text>
                                    <Input
                                        keyboardType="decimal-pad"
                                        value={service.sqft}
                                        onChangeText={(value) => updateService(service.id, { sqft: value })}
                                        placeholder="e.g. 150"
                                    />
                                </>
                            )}

                            {service.selected_unit === "ITEMS" && (
                                <>
                                    <View style={styles.itemsHeader}>
                                        <Text style={styles.fieldLabel}>Items and Pieces</Text>
                                        <Pressable
                                            style={styles.addItemBtn}
                                            onPress={() => addItemRow(service.id)}
                                        >
                                            <Ionicons name="add" size={14} color="#040947" />
                                            <Text style={styles.addItemText}>Add Item</Text>
                                        </Pressable>
                                    </View>

                                    {service.items.map((item) => (
                                        <View key={item.id} style={styles.itemRow}>
                                            <Input
                                                style={styles.itemNameInput}
                                                value={item.name}
                                                onChangeText={(value) =>
                                                    updateItemRow(service.id, item.id, { name: value })
                                                }
                                                placeholder="Item name (e.g. tshirt)"
                                            />
                                            <Input
                                                style={styles.itemPiecesInput}
                                                keyboardType="numeric"
                                                value={item.pieces}
                                                onChangeText={(value) =>
                                                    updateItemRow(service.id, item.id, { pieces: value })
                                                }
                                                placeholder="Pieces"
                                            />
                                            <Pressable
                                                onPress={() => removeItemRow(service.id, item.id)}
                                                disabled={service.items.length === 1}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={18}
                                                    color={service.items.length === 1 ? "#cbd5e1" : "#ef4444"}
                                                />
                                            </Pressable>
                                        </View>
                                    ))}
                                </>
                            )}

                            <Text style={styles.fieldLabel}>Description (optional)</Text>
                            <Input
                                value={service.description}
                                onChangeText={(value) => updateService(service.id, { description: value })}
                                placeholder="Any special notes"
                            />
                        </View>
                    );
                })}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Pickup Location</Text>
                    <View style={styles.mapWrap}>
                        {isLoadingLocation ? (
                            <View style={styles.mapLoader}>
                                <ActivityIndicator size="small" color="#040947" />
                                <Text style={styles.hint}>Loading current location...</Text>
                            </View>
                        ) : (
                            <MapView
                                style={styles.map}
                                region={region}
                                onRegionChangeComplete={setRegion}
                                onPress={(event) => {
                                    const coordinate = event.nativeEvent.coordinate;
                                    setCoordinates(coordinate.latitude, coordinate.longitude);
                                }}
                            >
                                {pickupLat != null && pickupLng != null && (
                                    <Marker
                                        coordinate={{ latitude: pickupLat, longitude: pickupLng }}
                                        draggable
                                        onDragEnd={(event) => {
                                            const coordinate = event.nativeEvent.coordinate;
                                            setCoordinates(coordinate.latitude, coordinate.longitude);
                                        }}
                                    />
                                )}
                            </MapView>
                        )}
                    </View>
                    <Input
                        value={pickupAddress}
                        onChangeText={setPickupAddress}
                        placeholder="Pickup address"
                    />
                    <View style={styles.coordRow}>
                        <Text style={styles.hint}>
                            Lat: {pickupLat != null ? pickupLat.toFixed(6) : "-"}
                        </Text>
                        <Text style={styles.hint}>
                            Lng: {pickupLng != null ? pickupLng.toFixed(6) : "-"}
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Pickup Window</Text>
                    <Pressable style={styles.pickerField} onPress={() => setActivePicker("date")}>
                        <Text style={styles.fieldLabel}>Date</Text>
                        <Text style={styles.pickerValue}>{formatDateLabel(pickupDate)}</Text>
                    </Pressable>
                    <Text style={styles.fieldLabel}>Range</Text>
                    <View style={styles.rangeRow}>
                        {PICKUP_RANGES.map((range) => {
                            const active = pickupRange === range.key;
                            return (
                                <Pressable
                                    key={range.key}
                                    style={[styles.rangeChip, active && styles.rangeChipActive]}
                                    onPress={() => setPickupRange(range.key)}
                                >
                                    <Ionicons
                                        name={active ? "checkbox" : "square-outline"}
                                        size={14}
                                        color={active ? "#fff" : "#475569"}
                                    />
                                    <Text style={[styles.rangeChipText, active && styles.rangeChipTextActive]}>
                                        {range.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentRow}>
                        {PAYMENT_OPTIONS.map((method) => (
                            <Pressable
                                key={method}
                                style={[styles.payCard, paymentMethod === method && styles.payCardActive]}
                                onPress={() => setPaymentMethod(method)}
                            >
                                <Text style={[styles.payText, paymentMethod === method && styles.payTextActive]}>
                                    {method === "CASH" ? "Cash" : "Online"}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={{ height: 110 }} />
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={[styles.submitBtn, createRequestMutation.isPending && styles.submitBtnDisabled]}
                    onPress={createRequestMutation.isPending ? undefined : handleCreateRequest}
                >
                    <Text style={styles.submitText}>
                        {createRequestMutation.isPending ? "Submitting..." : "Create Request"}
                    </Text>
                </Pressable>
            </View>

            <Modal
                visible={activePicker !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setActivePicker(null)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        {activePicker && (
                            <DateTimePicker
                                mode="date"
                                value={pickupDate}
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                                    if (event.type === "dismissed") {
                                        setActivePicker(null);
                                        return;
                                    }
                                    if (!selectedDate) return;

                                    setPickupDate(selectedDate);

                                    if (Platform.OS === "android") setActivePicker(null);
                                }}
                            />
                        )}
                        {Platform.OS === "ios" && (
                            <Pressable style={styles.doneBtn} onPress={() => setActivePicker(null)}>
                                <Text style={styles.doneBtnText}>Done</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    scroll: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#040947",
    },
    subtitle: {
        marginTop: 4,
        color: "#6b7280",
        fontSize: 13,
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    serviceCard: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#040947",
        marginBottom: 10,
    },
    fieldLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 8,
        marginBottom: 6,
        fontWeight: "600",
    },
    mapWrap: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
    },
    map: {
        width: "100%",
        height: 240,
    },
    mapLoader: {
        height: 240,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#f1f5f9",
    },
    coordRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    pickerField: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        backgroundColor: "#eff6ff",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    pickerValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0f172a",
    },
    timeRow: {
        flexDirection: "row",
        gap: 8,
    },
    timeField: {
        flex: 1,
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    categoryList: {
        gap: 8,
    },
    dropdownTrigger: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dropdownTriggerText: {
        color: "#111827",
        fontSize: 14,
        fontWeight: "600",
    },
    dropdownMenu: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#dbeafe",
        borderRadius: 10,
        overflow: "hidden",
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eef2ff",
    },
    dropdownOptionActive: {
        backgroundColor: "#ebf2ff",
    },
    dropdownOptionText: {
        color: "#111827",
        fontSize: 13,
        fontWeight: "600",
    },
    dropdownOptionTextActive: {
        color: "#040947",
    },
    categoryDescription: {
        marginTop: 8,
        color: "#64748b",
        fontSize: 12,
        lineHeight: 18,
    },
    unitChip: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    unitChipActive: {
        borderColor: "#040947",
        backgroundColor: "#040947",
    },
    unitChipText: {
        color: "#111827",
        fontSize: 14,
        fontWeight: "700",
    },
    unitChipTextActive: {
        color: "#fff",
    },
    rangeRow: {
        gap: 8,
    },
    rangeChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 999,
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    rangeChipActive: {
        borderColor: "#040947",
        backgroundColor: "#040947",
    },
    rangeChipText: {
        fontSize: 12,
        color: "#334155",
        fontWeight: "600",
    },
    rangeChipTextActive: {
        color: "#fff",
    },
    hint: {
        fontSize: 12,
        color: "#9ca3af",
        marginTop: 4,
    },
    servicesHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 2,
        marginBottom: 8,
    },
    addServiceBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#ebbc0122",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    addServiceText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#040947",
    },
    serviceTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    serviceTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    removeBtn: {
        borderRadius: 999,
        backgroundColor: "#fee2e2",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    removeBtnDisabled: {
        backgroundColor: "#f3f4f6",
    },
    removeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#ef4444",
    },
    itemsHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    addItemBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "#ebbc0122",
    },
    addItemText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#040947",
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 8,
    },
    itemNameInput: {
        flex: 1,
    },
    itemPiecesInput: {
        width: 100,
    },
    paymentRow: {
        flexDirection: "row",
        gap: 8,
    },
    payCard: {
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    payCardActive: {
        borderColor: "#040947",
        backgroundColor: "#040947",
    },
    payText: {
        color: "#0f172a",
        fontWeight: "700",
        fontSize: 14,
    },
    payTextActive: {
        color: "#fff",
    },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#f5f6fa",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    submitBtn: {
        borderRadius: 10,
        backgroundColor: "#040947",
        paddingVertical: 16,
        alignItems: "center",
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "#00000055",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 12,
    },
    doneBtn: {
        alignSelf: "flex-end",
        marginTop: 8,
        borderRadius: 999,
        backgroundColor: "#040947",
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    doneBtnText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
});
