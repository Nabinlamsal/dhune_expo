import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useActiveCategories } from "@/hooks/catalog/useCategory";
import { useCreateRequest } from "@/hooks/orders/useRequest";
import { Category } from "@/types/catalog/category";
import { PricingUnit } from "@/types/catalog/category-enums";
import { PaymentMethod } from "@/types/orders/orders-enums";
import { CreateRequestPayload } from "@/types/orders/requests";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

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

const PAYMENT_OPTIONS: PaymentMethod[] = ["CASH", "ONLINE"];

const UNIT_LABELS: Record<PricingUnit, string> = {
    KG: "Kilogram",
    ITEMS: "Item-based",
    SQFT: "Square Feet",
};

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

const toIsoString = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString();
};

export default function CreateRequestScreen() {
    const router = useRouter();

    const { data: categories = [], isLoading: isLoadingCategories } = useActiveCategories();
    const createRequestMutation = useCreateRequest();

    const [pickupAddress, setPickupAddress] = useState("");
    const [pickupTimeFrom, setPickupTimeFrom] = useState("");
    const [pickupTimeTo, setPickupTimeTo] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [services, setServices] = useState<ServiceForm[]>([createEmptyService()]);

    const categoryMap = useMemo(() => {
        const map = new Map<string, Category>();
        categories.forEach((category) => map.set(category.id, category));
        return map;
    }, [categories]);

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

        const fromIso = toIsoString(pickupTimeFrom.trim());
        const toIso = toIsoString(pickupTimeTo.trim());

        if (!fromIso || !toIso) {
            Alert.alert("Invalid time", "Use a valid date-time, e.g. 2026-03-15T10:30:00+05:45");
            return null;
        }

        if (new Date(fromIso).getTime() >= new Date(toIso).getTime()) {
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
            pickup_time_from: fromIso,
            pickup_time_to: toIso,
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

            setPickupAddress("");
            setPickupTimeFrom("");
            setPickupTimeTo("");
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
                <Text style={styles.subtitle}>Add one or more service categories in the same request.</Text>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Pickup Details</Text>
                    <Input
                        value={pickupAddress}
                        onChangeText={setPickupAddress}
                        placeholder="Pickup address"
                    />
                    <Input
                        value={pickupTimeFrom}
                        onChangeText={setPickupTimeFrom}
                        placeholder="Pickup from (ISO date-time)"
                        autoCapitalize="none"
                    />
                    <Input
                        value={pickupTimeTo}
                        onChangeText={setPickupTimeTo}
                        placeholder="Pickup to (ISO date-time)"
                        autoCapitalize="none"
                    />
                    <Text style={styles.hint}>Example: 2026-03-15T10:30:00+05:45</Text>

                    <Text style={styles.fieldLabel}>Payment Method</Text>
                    <View style={styles.chipRow}>
                        {PAYMENT_OPTIONS.map((method) => (
                            <Pressable
                                key={method}
                                style={[
                                    styles.chip,
                                    paymentMethod === method && styles.chipActive,
                                ]}
                                onPress={() => setPaymentMethod(method)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        paymentMethod === method && styles.chipTextActive,
                                    ]}
                                >
                                    {method}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

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
                        <View key={service.id} style={styles.card}>
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
                                <View style={styles.chipRow}>
                                    {categories.map((category) => {
                                        const active = service.category_id === category.id;
                                        return (
                                            <Pressable
                                                key={category.id}
                                                style={[styles.chip, active && styles.chipActive]}
                                                onPress={() => {
                                                    const defaultUnit = category.allowed_units[0] ?? "";
                                                    updateService(service.id, {
                                                        category_id: category.id,
                                                        selected_unit: defaultUnit,
                                                        quantity_value: "",
                                                        sqft: "",
                                                        items: [createEmptyItem()],
                                                    });
                                                }}
                                            >
                                                <Text
                                                    style={[styles.chipText, active && styles.chipTextActive]}
                                                >
                                                    {category.name}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}

                            <Text style={styles.fieldLabel}>Unit</Text>
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
                                                    style={[styles.chip, active && styles.chipActive]}
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
                                                        style={[styles.chipText, active && styles.chipTextActive]}
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

                <Button
                    title={createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                    onPress={createRequestMutation.isPending ? undefined : handleCreateRequest}
                />

                <View style={{ height: 24 }} />
            </ScrollView>
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
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 10,
    },
    fieldLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 10,
        marginBottom: 6,
        fontWeight: "600",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
        backgroundColor: "#fff",
    },
    chipActive: {
        borderColor: "#040947",
        backgroundColor: "#040947",
    },
    chipText: {
        color: "#111827",
        fontSize: 12,
        fontWeight: "600",
    },
    chipTextActive: {
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
});
