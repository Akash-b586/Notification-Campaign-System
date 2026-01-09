import { create } from 'zustand';
import type { Campaign, CampaignFilters } from '../types';

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  filters: CampaignFilters;
  isLoading: boolean;
  
  // Actions
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaignId: string, data: Partial<Campaign>) => void;
  deleteCampaign: (campaignId: string) => void;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  setFilters: (filters: Partial<CampaignFilters>) => void;
  setLoading: (loading: boolean) => void;
  getFilteredCampaigns: () => Campaign[];
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  filters: {},
  isLoading: false,

  setCampaigns: (campaigns: Campaign[]) => {
    set({ campaigns });
  },

  addCampaign: (campaign: Campaign) => {
    set((state) => ({ campaigns: [...state.campaigns, campaign] }));
  },

  updateCampaign: (campaignId: string, data: Partial<Campaign>) => {
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.campaign_id === campaignId ? { ...campaign, ...data } : campaign
      ),
    }));
  },

  deleteCampaign: (campaignId: string) => {
    set((state) => ({
      campaigns: state.campaigns.filter((campaign) => campaign.campaign_id !== campaignId),
    }));
  },

  setSelectedCampaign: (campaign: Campaign | null) => {
    set({ selectedCampaign: campaign });
  },

  setFilters: (filters: Partial<CampaignFilters>) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  getFilteredCampaigns: () => {
    const { campaigns, filters } = get();
    let filtered = [...campaigns];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((campaign) =>
        campaign.campaign_name.toLowerCase().includes(search) ||
        campaign.campaign_id.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((campaign) => campaign.status === filters.status);
    }

    if (filters.notification_type) {
      filtered = filtered.filter(
        (campaign) => campaign.notification_type === filters.notification_type
      );
    }

    return filtered;
  },
}));
