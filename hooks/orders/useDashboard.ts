"use client";

import { useVendorOfferStats, useAdminOfferStats } from "./useOffer";
import { useVendorOrderStats, useAdminOrderStats } from "./useOrder";
import { useAdminRequestStats } from "./useRequest";

export const useVendorDashboard = () => {

    const orders = useVendorOrderStats();
    const offers = useVendorOfferStats();

    return {
        orders,
        offers,
        loading:
            orders.isLoading ||
            offers.isLoading,
    };
};

export const useAdminDashboard = () => {

    const orders = useAdminOrderStats();
    const offers = useAdminOfferStats();
    const requests = useAdminRequestStats();

    return {
        orders,
        offers,
        requests,
        loading:
            orders.isLoading ||
            offers.isLoading ||
            requests.isLoading,
    };
};