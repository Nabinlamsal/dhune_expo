import Input from "@/components/ui/Input";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useActiveCategories } from "@/hooks/catalog/useCategory";
import { useCreateRequest } from "@/hooks/orders/useRequest";
import { Category } from "@/types/catalog/category";
import { PricingUnit } from "@/types/catalog/category-enums";
import { PaymentMethod } from "@/types/orders/orders-enums";
import { CreateRequestPayload } from "@/types/orders/requests";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
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
    const { theme } = useAppTheme();
    const { t } = useTranslation();

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
                    Alert.alert(t("requests.locationDenied"), t("requests.locationDeniedMessage"));
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
                Alert.alert(t("requests.locationUnavailable"), t("requests.locationUnavailableMessage"));
            } finally {
                if (mounted) setIsLoadingLocation(false);
            }
        };

        void initLocation();

        return () => {
            mounted = false;
        };
    }, [t, updateAddressFromCoordinates]);

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
            Alert.alert(t("requests.missingField"), t("requests.pickupAddressRequired"));
            return null;
        }

        if (pickupLat == null || pickupLng == null) {
            Alert.alert(t("requests.missingLocation"), t("requests.missingLocationMessage"));
            return null;
        }

        const selectedRange = PICKUP_RANGES.find((range) => range.key === pickupRange)!;
        const fromDateTime = buildDateWithHour(pickupDate, selectedRange.startHour);
        const toDateTime = buildDateWithHour(pickupDate, selectedRange.endHour);

        if (fromDateTime.getTime() >= toDateTime.getTime()) {
            Alert.alert(t("requests.timeRangeInvalid"), t("requests.timeRangeInvalidMessage"));
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
            Alert.alert(t("requests.created"), t("requests.createdMessage"));

            setPaymentMethod("CASH");
            setServices([createEmptyService()]);

            router.replace("/(tabs)/requests");
        } catch (error: any) {
            Alert.alert(t("requests.createFailed"), error?.message ?? t("errors.defaultTryAgain"));
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <KeyboardWrapper
                contentContainerStyle={styles.scroll}
                scrollViewProps={{ showsVerticalScrollIndicator: false }}
                dismissOnTap={false}
            >
                <ScreenHeader
                    title={t("requests.createRequest")}
                    subtitle={t("requests.createSubtitle")}
                    backHref="/(tabs)/requests"
                />

                <View style={styles.servicesHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t("requests.services")}</Text>
                    <Pressable style={[styles.addServiceBtn, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]} onPress={addService}>
                        <Ionicons name="add" size={16} color={theme.primary} />
                        <Text style={[styles.addServiceText, { color: theme.primary }]}>{t("requests.addCategory")}</Text>
                    </Pressable>
                </View>

                {services.map((service, index) => {
                    const selectedCategory = categoryMap.get(service.category_id);
                    const unitOptions = selectedCategory?.allowed_units ?? [];

                    return (
                        <View key={service.id} style={[styles.card, styles.serviceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={styles.serviceTopRow}>
                                <Text style={[styles.serviceTitle, { color: theme.primary }]}>{t("common.service", { number: index + 1 })}</Text>
                                <Pressable
                                    onPress={() => removeService(service.id)}
                                    disabled={services.length === 1}
                                    style={[styles.removeBtn, services.length === 1 && styles.removeBtnDisabled]}
                                >
                                    <Text style={[styles.removeText, { color: services.length === 1 ? theme.textSoft : theme.danger }]}>{t("common.remove")}</Text>
                                </Pressable>
                            </View>

                            <Text style={[styles.fieldLabel, { color: theme.primary }]}>{t("common.category")}</Text>
                            {isLoadingCategories ? (
                                <Text style={[styles.hint, { color: theme.textMuted }]}>{t("requests.loadingCategories")}</Text>
                            ) : categories.length === 0 ? (
                                <Text style={[styles.hint, { color: theme.textMuted }]}>{t("requests.noActiveCategories")}</Text>
                            ) : (
                                <View>
                                    <Pressable
                                        style={[styles.dropdownTrigger, { borderColor: theme.inputBorder, backgroundColor: theme.inputBackground }]}
                                        onPress={() =>
                                            setOpenCategoryFor((current) =>
                                                current === service.id ? null : service.id
                                            )
                                        }
                                    >
                                        <Text style={[styles.dropdownTriggerText, { color: selectedCategory ? theme.text : theme.inputPlaceholder }]}>
                                            {selectedCategory?.name ?? t("requests.categoryPlaceholder")}
                                        </Text>
                                        <Ionicons
                                            name={openCategoryFor === service.id ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color={theme.primary}
                                        />
                                    </Pressable>

                                    {openCategoryFor === service.id && (
                                        <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.borderStrong }]}>
                                            {categories.map((category) => {
                                                const active = service.category_id === category.id;
                                                return (
                                                    <Pressable
                                                        key={category.id}
                                                        style={[
                                                            styles.dropdownOption,
                                                            {
                                                                backgroundColor: active ? theme.primarySoft : theme.surface,
                                                                borderTopColor: theme.border,
                                                            },
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
                                                                { color: active ? theme.primary : theme.text },
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
                                        <Text style={[styles.categoryDescription, { color: theme.textMuted }]}>
                                            {selectedCategory.description}
                                        </Text>
                                    )}
                                </View>
                            )}

                            <Text style={[styles.fieldLabel, { color: theme.primary }]}>Service Unit</Text>
                            {service.category_id ? (
                                unitOptions.length === 0 ? (
                                    <Text style={[styles.hint, { color: theme.textMuted }]}>No units configured for this category.</Text>
                                ) : (
                                    <View style={styles.chipRow}>
                                        {unitOptions.map((unit) => {
                                            const active = service.selected_unit === unit;
                                            return (
                                                <Pressable
                                                    key={unit}
                                                    style={[
                                                        styles.unitChip,
                                                        { backgroundColor: theme.card, borderColor: theme.border },
                                                        active && { backgroundColor: theme.primary, borderColor: theme.primary },
                                                    ]}
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
                                                        style={[styles.unitChipText, { color: active ? theme.primaryContrast : theme.text }]}
                                                    >
                                                        {UNIT_LABELS[unit]}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )
                            ) : (
                                <Text style={[styles.hint, { color: theme.textMuted }]}>Select a category first.</Text>
                            )}

                            {service.selected_unit === "KG" && (
                                <>
                                    <Text style={[styles.fieldLabel, { color: theme.primary }]}>Quantity (KG)</Text>
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
                                    <Text style={[styles.fieldLabel, { color: theme.primary }]}>Total SQFT</Text>
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
                                        <Text style={[styles.fieldLabel, { color: theme.primary }]}>{t("requests.itemsAndPieces")}</Text>
                                        <Pressable
                                            style={[styles.addItemBtn, { backgroundColor: theme.accentSoft }]}
                                            onPress={() => addItemRow(service.id)}
                                        >
                                            <Ionicons name="add" size={14} color={theme.primary} />
                                            <Text style={[styles.addItemText, { color: theme.primary }]}>{t("requests.addItem")}</Text>
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
                                                placeholder={t("requests.itemNamePlaceholder")}
                                            />
                                            <Input
                                                style={styles.itemPiecesInput}
                                                keyboardType="numeric"
                                                value={item.pieces}
                                                onChangeText={(value) =>
                                                    updateItemRow(service.id, item.id, { pieces: value })
                                                }
                                                placeholder={t("forms.pieces")}
                                            />
                                            <Pressable
                                                onPress={() => removeItemRow(service.id, item.id)}
                                                disabled={service.items.length === 1}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={18}
                                                    color={service.items.length === 1 ? theme.disabled : theme.danger}
                                                />
                                            </Pressable>
                                        </View>
                                    ))}
                                </>
                            )}

                            <Text style={[styles.fieldLabel, { color: theme.primary }]}>{t("forms.descriptionOptional")}</Text>
                            <Input
                                value={service.description}
                                onChangeText={(value) => updateService(service.id, { description: value })}
                                placeholder={t("forms.specialNotesPlaceholder")}
                            />
                        </View>
                    );
                })}

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t("requests.pickupLocation")}</Text>
                    <View style={[styles.mapWrap, { borderColor: theme.border }]}>
                        {isLoadingLocation ? (
                            <View style={styles.mapLoader}>
                                <ActivityIndicator size="small" color={theme.primary} />
                                <Text style={[styles.hint, { color: theme.textMuted }]}>{t("requests.loadingCurrentLocation")}</Text>
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
                        placeholder={t("requests.pickupAddress")}
                    />
                    <View style={styles.coordRow}>
                        <Text style={[styles.hint, { color: theme.textMuted }]}>
                            Lat: {pickupLat != null ? pickupLat.toFixed(6) : "-"}
                        </Text>
                        <Text style={[styles.hint, { color: theme.textMuted }]}>
                            Lng: {pickupLng != null ? pickupLng.toFixed(6) : "-"}
                        </Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t("requests.pickupWindow")}</Text>
                    <Pressable style={[styles.pickerField, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]} onPress={() => setActivePicker("date")}>
                        <Text style={[styles.fieldLabel, { color: theme.primary }]}>{t("common.date")}</Text>
                        <Text style={[styles.pickerValue, { color: theme.text }]}>{formatDateLabel(pickupDate)}</Text>
                    </Pressable>
                    <Text style={[styles.fieldLabel, { color: theme.primary }]}>{t("common.range")}</Text>
                    <View style={styles.rangeRow}>
                        {PICKUP_RANGES.map((range) => {
                            const active = pickupRange === range.key;
                            return (
                                <Pressable
                                    key={range.key}
                                    style={[
                                        styles.rangeChip,
                                        { backgroundColor: theme.card, borderColor: theme.border },
                                        active && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    ]}
                                    onPress={() => setPickupRange(range.key)}
                                >
                                    <Ionicons
                                        name={active ? "checkbox" : "square-outline"}
                                        size={14}
                                        color={active ? theme.primaryContrast : theme.textMuted}
                                    />
                                    <Text style={[styles.rangeChipText, { color: active ? theme.primaryContrast : theme.text }]}>
                                        {range.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t("requests.paymentMethod")}</Text>
                    <View style={styles.paymentRow}>
                        {PAYMENT_OPTIONS.map((method) => (
                            <Pressable
                                key={method}
                                style={[
                                    styles.payCard,
                                    { backgroundColor: theme.card, borderColor: theme.border },
                                    paymentMethod === method && { backgroundColor: theme.primary, borderColor: theme.primary },
                                ]}
                                onPress={() => setPaymentMethod(method)}
                            >
                                <Text style={[styles.payText, { color: paymentMethod === method ? theme.primaryContrast : theme.text }]}>
                                    {method === "CASH" ? t("common.cash") : t("common.online")}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={{ height: 110 }} />
            </KeyboardWrapper>

            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <Pressable
                    style={[styles.submitBtn, { backgroundColor: theme.primary }, createRequestMutation.isPending && styles.submitBtnDisabled]}
                    onPress={createRequestMutation.isPending ? undefined : handleCreateRequest}
                >
                    <Text style={styles.submitText}>
                        {createRequestMutation.isPending ? t("requests.submitting") : t("requests.createRequest")}
                    </Text>
                </Pressable>
            </View>

            <Modal
                visible={activePicker !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setActivePicker(null)}
            >
                <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
                    <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        {activePicker && (
                            <DateTimePicker
                                mode="date"
                                value={pickupDate}
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                textColor={theme.text}
                                accentColor={theme.primary}
                                themeVariant={theme.mode}
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
                            <Pressable style={[styles.doneBtn, { backgroundColor: theme.primary }]} onPress={() => setActivePicker(null)}>
                                <Text style={[styles.doneBtnText, { color: theme.primaryContrast }]}>{t("common.done")}</Text>
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
        backgroundColor: "#edf4ff",
    },
    scroll: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#dbe7ff",
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
        paddingVertical: 5,
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
        backgroundColor: "#edf4ff",
        borderTopWidth: 1,
        borderTopColor: "#dbe7ff",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    submitBtn: {
        borderRadius: 14,
        backgroundColor: "#0b2457",
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
