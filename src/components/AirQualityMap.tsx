import React from 'react';
import { MonitoringStation, FarmFireHotspot } from '../types';
import { PrivateSatelliteMap } from './PrivateSatelliteMap';

interface AirQualityMapProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
  farmFires: FarmFireHotspot[];
  onOpenStationDetail: (station: MonitoringStation) => void;
  fullHeight?: boolean;
}

export const AirQualityMap: React.FC<AirQualityMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  farmFires,
  onOpenStationDetail,
  fullHeight = false,
}) => {
  return (
    <PrivateSatelliteMap
      stations={stations}
      selectedStation={selectedStation}
      onSelectStation={onSelectStation}
      farmFires={farmFires}
      onOpenStationDetail={onOpenStationDetail}
      fullHeight={fullHeight}
    />
  );
};
