import React, { useRef, useEffect, useState } from 'react';
import './RecipientDetails.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import imageStatic from "../../assets/images/491e6ac2b8c368d99910b527aa775a48.jpg";

const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Используем переменную окружения для базового URL
const API_URL = process.env.REACT_APP_API_URL;

const RecipientDetails = ({ recipient }) => {
  const mapRef = useRef();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [referenceData, setReferenceData] = useState({
    regions: [],
    cities: [],
    townships: [],
    villages: []
  });

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
    if (recipient && recipient.id) {
      fetchPaymentHistory(recipient.id);
    }
    fetchReferenceData();
  }, [recipient]);

  const fetchPaymentHistory = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/recipient/get_recipient_payment_history/${id}`);
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistory([]);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [regionsResponse, citiesResponse, townshipsResponse, villagesResponse] = await Promise.all([
        axios.get(`${API_URL}/reference/ref_region/`),
        axios.get(`${API_URL}/reference/ref_city/`),
        axios.get(`${API_URL}/reference/ref_township/`),
        axios.get(`${API_URL}/reference/ref_village/`)
      ]);
      
      setReferenceData({
        regions: regionsResponse.data.results,
        cities: citiesResponse.data.results,
        townships: townshipsResponse.data.results,
        villages: villagesResponse.data.results
      });
    } catch (error) {
      console.error('Error fetching reference data:', error);
      setReferenceData({
        regions: [],
        cities: [],
        townships: [],
        villages: []
      });
    }
  };

  const getRegionNameById = (id) => {
    const region = referenceData.regions.find(region => region.id === id);
    return region ? region.name_ru : 'N/A';
  };

  const getCityNameById = (id) => {
    const city = referenceData.cities.find(city => city.id === id);
    return city ? city.name_ru : 'N/A';
  };

  const getTownshipNameById = (id) => {
    const township = referenceData.townships.find(township => township.id === id);
    return township ? township.name_ru : 'N/A';
  };

  const getVillageNameById = (id) => {
    const village = referenceData.villages.find(village => village.id === id);
    return village ? village.name_ru : 'N/A';
  };

  if (!recipient) {
    return <div>Загрузка...</div>;
  }

  const {
    first_name,
    second_name,
    third_name,
    pin,
    address = {},
    payment_sum,
    payment_status = {},
    nationality = {},
    gender = {},
    date_of_birth,
    relative = []
  } = recipient;
  const { latitude, longitude, photo } = address;
  
  const typeOfrelative = (relative) => {
    if (relative === 1) { return "Сын"; } else { return "Дочь"; }
  }

  return (
    <div className="recipient-details">
      <h2>Детали получателя</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>ФИО:</strong></td>
            <td>{first_name} {second_name} {third_name}</td>
          </tr>
          <tr>
            <td><strong>ПИН:</strong></td>
            <td>{pin}</td>
          </tr>
          <tr>
            <td><strong>Область:</strong></td>
            <td>{getRegionNameById(address.region) || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Город:</strong></td>
            <td>{getCityNameById(address.city) || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Поселок:</strong></td>
            <td>{getTownshipNameById(address.township) || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Село:</strong></td>
            <td>{getVillageNameById(address.village) || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Сумма платежа:</strong></td>
            <td>{payment_sum}</td>
          </tr>
          <tr>
            <td><strong>Статус платежа:</strong></td>
            <td>{payment_status ? payment_status.name_ru : 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Национальность:</strong></td>
            <td>{nationality ? nationality.name_ru : 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Пол:</strong></td>
            <td>{gender ? gender.name_ru : 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Дата рождения:</strong></td>
            <td>{date_of_birth}</td>
          </tr>
        </tbody>
      </table>
      <h3>Родственники:</h3>
      {relative.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>ПИН</th>
              <th>Дата рождения</th>
              <th>Родственник</th>
            </tr>
          </thead>
          <tbody>
            {relative.map((rel) => (
              <tr key={rel.id}>
                <td>{rel.first_name} {rel.second_name} {rel.third_name}</td>
                <td>{rel.pin}</td>
                <td>{rel.date_of_birth}</td>
                <td>{typeOfrelative(rel.relative_type) || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Нет родственников</div>
      )}
      {photo && <div className='photoDiv'><strong>Фото:</strong><img src={imageStatic} alt="Address Photo" style={{ width: '450px', maxHeight: '300px' }} /></div>}
      
      {latitude && longitude && (
        <div>
          <strong>Карта:</strong>
          <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: '300px', width: '100%' }} whenCreated={mapInstance => { mapRef.current = mapInstance; }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[latitude, longitude]} icon={customIcon}>
              <Popup>
                {first_name} {second_name} {third_name}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
      
      <h3>История платежей:</h3>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map(payment => (
            <tr key={payment.created_date}>
              <td>{payment.created_date}</td>
              <td>{payment.payment_sum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecipientDetails;
