import { AdminSection } from "../../components/AdminSection";
import { EstimatorSection } from "../../components/EstimatorSection";
import { GarageSection } from "../../components/GarageSection";
import { LeaderboardSection } from "../../components/LeaderboardSection";
import { LiveMapSection } from "../../components/LiveMapSection";
import { ProfileSection } from "../../components/ProfileSection";
import { RefuelHistorySection } from "../../components/RefuelHistorySection";
import { VerifySection } from "../../components/VerifySection";
import type { DashboardSection, RouteEstimate, UnitPreset } from "../models";
import type { AuthUser, FuelType, LeaderboardEntry, Refuel, Region, Station, Trip, Vehicle } from "../../types";

type DashboardSectionContentProps = {
  activeSection: DashboardSection;
  moduleCardSx: object;
  darkMode: boolean;
  importingStations: boolean;
  importStations: () => Promise<void>;
  setError: (value: string) => void;
  routeLoading: boolean;
  mapRoute: RouteEstimate | null;
  locationAccuracyM: number | null;
  mapHostRef: React.RefObject<HTMLDivElement | null>;
  locating: boolean;
  detectLocation: () => void;
  location: { lat: number; lon: number };
  canManageAdminContent: boolean;
  stationForm: {
    name: string;
    brand: string;
    latitude: string;
    longitude: string;
    region: Region;
    address: string;
    initialGasolinePrice: string;
  };
  updateStationFormField: <K extends keyof DashboardSectionContentProps["stationForm"]>(
    field: K,
    value: DashboardSectionContentProps["stationForm"][K],
  ) => void;
  stationMapPickerEnabled: boolean;
  setStationMapPickerEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateStation: () => Promise<void>;
  handleUpdateStation: () => Promise<void>;
  handleDeleteStation: () => Promise<void>;
  selectedStationId: string;
  nearestStation: Station | null;
  selectedStation: Station | null;
  stations: Station[];
  setSelectedStationId: React.Dispatch<React.SetStateAction<string>>;
  getMapGasolinePrice: (station: Station) => Station["fuelPrices"][number] | null;
  routingBusy: boolean;
  routeEstimate: RouteEstimate | null;
  tripForm: {
    vehicleId: string;
    origin: string;
    destination: string;
    distanceKm: string;
    fuelPricePerLiter: string;
  };
  reverseGeocodingBusy: boolean;
  estimatorMapHostRef: React.RefObject<HTMLDivElement | null>;
  setTripForm: React.Dispatch<
    React.SetStateAction<{
      vehicleId: string;
      origin: string;
      destination: string;
      distanceKm: string;
      fuelPricePerLiter: string;
    }>
  >;
  vehicles: Vehicle[];
  estimateTrip: () => Promise<void>;
  trips: Trip[];
  refuelForm: {
    vehicleId: string;
    stationId: string;
    liters: string;
    totalCost: string;
  };
  setRefuelForm: React.Dispatch<
    React.SetStateAction<{
      vehicleId: string;
      stationId: string;
      liters: string;
      totalCost: string;
    }>
  >;
  addRefuel: () => Promise<void>;
  refuels: Refuel[];
  editingRefuelId: string | null;
  editingRefuelForm: {
    vehicleId: string;
    stationId: string;
    liters: string;
    totalCost: string;
  };
  setEditingRefuelId: (value: string | null) => void;
  setEditingRefuelForm: React.Dispatch<
    React.SetStateAction<{
      vehicleId: string;
      stationId: string;
      liters: string;
      totalCost: string;
    }>
  >;
  updateRefuel: (refuelId: string) => Promise<void>;
  deleteRefuel: (refuelId: string) => Promise<void>;
  fuelTypes: FuelType[];
  garagePresets: UnitPreset[];
  unitImageMap: Record<string, string>;
  imageFallback: string;
  presetForm: UnitPreset;
  setPresetForm: React.Dispatch<React.SetStateAction<UnitPreset>>;
  editingPresetName: string | null;
  setEditingPresetName: (value: string | null) => void;
  createPreset: () => void;
  updatePreset: () => void;
  deletePreset: (presetName: string) => void;
  addPresetUnit: (preset: UnitPreset) => Promise<void>;
  vehicleForm: {
    name: string;
    fuelType: FuelType;
    efficiencyKmPerL: string;
  };
  setVehicleForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      fuelType: FuelType;
      efficiencyKmPerL: string;
    }>
  >;
  addVehicle: () => Promise<void>;
  editingVehicleId: string | null;
  editingVehicleForm: {
    name: string;
    fuelType: FuelType;
    efficiencyKmPerL: string;
  };
  setEditingVehicleId: (value: string | null) => void;
  setEditingVehicleForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      fuelType: FuelType;
      efficiencyKmPerL: string;
    }>
  >;
  updateVehicle: (vehicleId: string) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  priceFuelType: FuelType;
  setPriceFuelType: (value: FuelType) => void;
  priceValue: string;
  setPriceValue: (value: string) => void;
  submitPrice: () => Promise<void>;
  selectedStationPrices: Station["fuelPrices"];
  votingPriceId: string;
  votePrice: (priceId: string, isAccurate: boolean) => Promise<void>;
  leaderboard: LeaderboardEntry[];
  user: AuthUser | null;
  profilePhotoDataUrl: string;
  openProfilePhotoPreview: () => void;
  openProfilePhotoPicker: () => void;
  removeProfilePhoto: () => void;
  currentLocationName: string;
  formatPrice: (value: string | number) => string;
  formatCost: (value: string | number) => string;
};

export const DashboardSectionContent = ({
  activeSection,
  moduleCardSx,
  darkMode,
  importingStations,
  importStations,
  setError,
  routeLoading,
  mapRoute,
  locationAccuracyM,
  mapHostRef,
  locating,
  detectLocation,
  location,
  canManageAdminContent,
  stationForm,
  updateStationFormField,
  stationMapPickerEnabled,
  setStationMapPickerEnabled,
  handleCreateStation,
  handleUpdateStation,
  handleDeleteStation,
  selectedStationId,
  nearestStation,
  selectedStation,
  stations,
  setSelectedStationId,
  getMapGasolinePrice,
  routingBusy,
  routeEstimate,
  tripForm,
  reverseGeocodingBusy,
  estimatorMapHostRef,
  setTripForm,
  vehicles,
  estimateTrip,
  trips,
  refuelForm,
  setRefuelForm,
  addRefuel,
  refuels,
  editingRefuelId,
  editingRefuelForm,
  setEditingRefuelId,
  setEditingRefuelForm,
  updateRefuel,
  deleteRefuel,
  fuelTypes,
  garagePresets,
  unitImageMap,
  imageFallback,
  presetForm,
  setPresetForm,
  editingPresetName,
  setEditingPresetName,
  createPreset,
  updatePreset,
  deletePreset,
  addPresetUnit,
  vehicleForm,
  setVehicleForm,
  addVehicle,
  editingVehicleId,
  editingVehicleForm,
  setEditingVehicleId,
  setEditingVehicleForm,
  updateVehicle,
  deleteVehicle,
  priceFuelType,
  setPriceFuelType,
  priceValue,
  setPriceValue,
  submitPrice,
  selectedStationPrices,
  votingPriceId,
  votePrice,
  leaderboard,
  user,
  profilePhotoDataUrl,
  openProfilePhotoPreview,
  openProfilePhotoPicker,
  removeProfilePhoto,
  currentLocationName,
  formatPrice,
  formatCost,
}: DashboardSectionContentProps) => {
  if (activeSection === "admin") {
    return (
      <AdminSection
        darkMode={darkMode}
        importingStations={importingStations}
        importStations={importStations}
        setError={setError}
      />
    );
  }

  if (activeSection === "map") {
    return (
      <LiveMapSection
        darkMode={darkMode}
        routeLoading={routeLoading}
        mapRoute={mapRoute}
        locationAccuracyM={locationAccuracyM}
        mapHostRef={mapHostRef}
        locating={locating}
        detectLocation={detectLocation}
        location={location}
        canManageAdminContent={canManageAdminContent}
        stationForm={stationForm}
        updateStationFormField={updateStationFormField}
        stationMapPickerEnabled={stationMapPickerEnabled}
        setStationMapPickerEnabled={setStationMapPickerEnabled}
        handleCreateStation={handleCreateStation}
        handleUpdateStation={handleUpdateStation}
        handleDeleteStation={handleDeleteStation}
        selectedStationId={selectedStationId}
        nearestStation={nearestStation}
        selectedStation={selectedStation}
        stations={stations}
        setSelectedStationId={setSelectedStationId}
        getPreferredFuelPrice={getMapGasolinePrice}
        formatPrice={formatPrice}
      />
    );
  }

  if (activeSection === "estimator") {
    return (
      <EstimatorSection
        moduleCardSx={moduleCardSx}
        darkMode={darkMode}
        routingBusy={routingBusy}
        routeEstimate={routeEstimate}
        tripForm={tripForm}
        reverseGeocodingBusy={reverseGeocodingBusy}
        estimatorMapHostRef={estimatorMapHostRef}
        setTripForm={setTripForm}
        vehicles={vehicles}
        estimateTrip={estimateTrip}
        setError={setError}
        trips={trips}
        formatCost={formatCost}
      />
    );
  }

  if (activeSection === "history") {
    return (
      <RefuelHistorySection
        moduleCardSx={moduleCardSx}
        darkMode={darkMode}
        vehicles={vehicles}
        stations={stations}
        refuelForm={refuelForm}
        setRefuelForm={setRefuelForm}
        addRefuel={addRefuel}
        setError={setError}
        refuels={refuels}
        editingRefuelId={editingRefuelId}
        editingRefuelForm={editingRefuelForm}
        setEditingRefuelId={setEditingRefuelId}
        setEditingRefuelForm={setEditingRefuelForm}
        updateRefuel={updateRefuel}
        deleteRefuel={deleteRefuel}
      />
    );
  }

  if (activeSection === "garage") {
    return (
      <GarageSection
        moduleCardSx={moduleCardSx}
        darkMode={darkMode}
        fuelTypes={fuelTypes}
        garagePresets={garagePresets}
        unitImageMap={unitImageMap}
        imageFallback={imageFallback}
        canManageAdminContent={canManageAdminContent}
        presetForm={presetForm}
        setPresetForm={setPresetForm}
        editingPresetName={editingPresetName}
        setEditingPresetName={setEditingPresetName}
        createPreset={createPreset}
        updatePreset={updatePreset}
        deletePreset={deletePreset}
        addPresetUnit={addPresetUnit}
        vehicles={vehicles}
        vehicleForm={vehicleForm}
        setVehicleForm={setVehicleForm}
        addVehicle={addVehicle}
        editingVehicleId={editingVehicleId}
        editingVehicleForm={editingVehicleForm}
        setEditingVehicleId={setEditingVehicleId}
        setEditingVehicleForm={setEditingVehicleForm}
        updateVehicle={updateVehicle}
        deleteVehicle={deleteVehicle}
        setError={setError}
      />
    );
  }

  if (activeSection === "verify") {
    return (
      <VerifySection
        moduleCardSx={moduleCardSx}
        darkMode={darkMode}
        selectedStationId={selectedStationId}
        setSelectedStationId={setSelectedStationId}
        syncRefuelStation={(stationId) => setRefuelForm((prev) => ({ ...prev, stationId }))}
        stations={stations}
        fuelTypes={fuelTypes}
        priceFuelType={priceFuelType}
        setPriceFuelType={setPriceFuelType}
        priceValue={priceValue}
        setPriceValue={setPriceValue}
        submitPrice={submitPrice}
        setError={setError}
        selectedStationPrices={selectedStationPrices}
        votingPriceId={votingPriceId}
        votePrice={votePrice}
        formatPrice={formatPrice}
      />
    );
  }

  if (activeSection === "leaderboard") {
    return <LeaderboardSection moduleCardSx={moduleCardSx} darkMode={darkMode} leaderboard={leaderboard} user={user} />;
  }

  return (
    <ProfileSection
      moduleCardSx={moduleCardSx}
      darkMode={darkMode}
      user={user}
      profilePhotoDataUrl={profilePhotoDataUrl}
      openProfilePhotoPreview={openProfilePhotoPreview}
      openProfilePhotoPicker={openProfilePhotoPicker}
      removeProfilePhoto={removeProfilePhoto}
      vehicles={vehicles}
      trips={trips}
      refuels={refuels}
      currentLocationName={currentLocationName}
      locationAccuracyM={locationAccuracyM}
    />
  );
};
