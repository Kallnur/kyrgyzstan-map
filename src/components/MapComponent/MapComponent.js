import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import kyrgyzstanRegions from './KyrgyzstanBorders.json';
import SearchBox from '../SearchBox/SearchComponent';
import './MapComponent.css';

const API_URL = process.env.REACT_APP_API_URL;

const KyrgyzstanMask = () => {
  const map = useMap();

  useEffect(() => {
    const kyrgyzstanLayer = L.geoJSON(kyrgyzstanRegions);
    const bounds = kyrgyzstanLayer.getBounds();

    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
  }, [map]);

  return null;
};

const MapComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [fullRegionData, setFullRegionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    const fetchAllRegionInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/recipient/get_data_from_regions/`);
        console.log(response.data);
        setFullRegionData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setFullRegionData([]);
        setLoading(false);
      }
    };
    fetchAllRegionInfo();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      const kyrgyzstanLayer = L.geoJSON(kyrgyzstanRegions);
      const bounds = kyrgyzstanLayer.getBounds();
      map.fitBounds(bounds);
   
      map.setView([41.2044, 74.7661]);
    }
  }, [mapRef]);

  const position = [41.2044, 74.7661];
  const filteredRegions = kyrgyzstanRegions;

  const handleSearch = () => {
    const foundRegion = filteredRegions.features.find(
      (feature) => feature.properties.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (foundRegion) {
      setHoveredRegion(foundRegion.properties);
    }
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindTooltip(feature.properties.name, {
        permanent: true,
        direction: "center",
        className: "label-tooltip"
      });
    }

    layer.on({
      mouseover: (e) => {
        const targetLayer = e.target;
        targetLayer.setStyle({
          weight: 3,
          fillOpacity: 1,
          color: "white" 
        });
        const regionDetails = fullRegionData.find(data => data.region === feature.properties.id);
        setHoveredRegion({
          ...feature.properties,
          details: regionDetails,
          latlng: e.latlng
        });
      },
      mouseout: (e) => {
        const targetLayer = e.target;
        targetLayer.setStyle({
          weight: 1,
          fillOpacity: 1,
          color: "white" 
        });
        setHoveredRegion(null);
      }
    });
  };

  return (
    <div className="container">
      <div className="map-wrapper">
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          <MapContainer
            center={position}
            zoom={7}
            className='Map'
            zoomControl={false}
            attributionControl={false}
            whenCreated={mapInstance => { mapRef.current = mapInstance }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <GeoJSON
              data={filteredRegions}
              style={(feature) => ({
                fillColor: '#29B6F6',
                fillOpacity: 1,
                color: 'white',
                weight: 1,
              })}
              onEachFeature={onEachFeature}
            />
            <KyrgyzstanMask />
          </MapContainer>
        )}
        {hoveredRegion && hoveredRegion.latlng && (
          <div className="custom-popup">
            <h3>{hoveredRegion.name}</h3>
            {hoveredRegion.details && (
              <>
                <p>Количество получателей: {hoveredRegion.details.recipient_count}</p>
                <p>Мужчины получатели: {hoveredRegion.details.recipient_male_count}</p>
                <p>Женщины получатели: {hoveredRegion.details.recipient_female_count}</p>
                <p>Дети до 16-лет: {hoveredRegion.details.relative_position_count}</p>
                <p>Количество всего человек: {hoveredRegion.details.relative_count}</p>
                <p>Общая сумма: {hoveredRegion.details.payment_sum}</p>
              </>
            )}
          </div>
        )}
      </div>
      <div className="info-wrapper">
        <SearchBox
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
        />
      </div>
    </div>
  );
};

export default MapComponent;
