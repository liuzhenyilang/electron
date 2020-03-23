export const CPUThrottlingRates={NoThrottling:1,MidTierMobile:4,LowEndMobile:6,};export const NoThrottlingConditions={title:SDK.NetworkManager.NoThrottlingConditions.title,description:Common.UIString('No throttling'),network:SDK.NetworkManager.NoThrottlingConditions,cpuThrottlingRate:CPUThrottlingRates.NoThrottling,};export const OfflineConditions={title:SDK.NetworkManager.OfflineConditions.title,description:Common.UIString('No internet connectivity'),network:SDK.NetworkManager.OfflineConditions,cpuThrottlingRate:CPUThrottlingRates.NoThrottling,};export const LowEndMobileConditions={title:Common.UIString('Low-end mobile'),description:Common.UIString('Slow 3G & 6x CPU slowdown'),network:SDK.NetworkManager.Slow3GConditions,cpuThrottlingRate:CPUThrottlingRates.LowEndMobile,};export const MidTierMobileConditions={title:Common.UIString('Mid-tier mobile'),description:Common.UIString('Fast 3G & 4x CPU slowdown'),network:SDK.NetworkManager.Fast3GConditions,cpuThrottlingRate:CPUThrottlingRates.MidTierMobile,};export const CustomConditions={title:Common.UIString('Custom'),description:Common.UIString('Check Network and Performance panels'),};export const mobilePresets=[MidTierMobileConditions,LowEndMobileConditions,CustomConditions];export const advancedMobilePresets=[OfflineConditions,];export const networkPresets=[SDK.NetworkManager.Fast3GConditions,SDK.NetworkManager.Slow3GConditions,SDK.NetworkManager.OfflineConditions,];export const cpuThrottlingPresets=[CPUThrottlingRates.NoThrottling,CPUThrottlingRates.MidTierMobile,CPUThrottlingRates.LowEndMobile,];self.MobileThrottling=self.MobileThrottling||{};MobileThrottling=MobileThrottling||{};MobileThrottling.CPUThrottlingRates=CPUThrottlingRates;MobileThrottling.NoThrottlingConditions=NoThrottlingConditions;MobileThrottling.OfflineConditions=OfflineConditions;MobileThrottling.LowEndMobileConditions=LowEndMobileConditions;MobileThrottling.MidTierMobileConditions=MidTierMobileConditions;MobileThrottling.CustomConditions=CustomConditions;MobileThrottling.mobilePresets=mobilePresets;MobileThrottling.advancedMobilePresets=advancedMobilePresets;MobileThrottling.networkPresets=networkPresets;MobileThrottling.cpuThrottlingPresets=cpuThrottlingPresets;MobileThrottling.Conditions;MobileThrottling.NetworkThrottlingConditionsGroup;MobileThrottling.MobileThrottlingConditionsGroup;MobileThrottling.ConditionsList;MobileThrottling.PlaceholderConditions;