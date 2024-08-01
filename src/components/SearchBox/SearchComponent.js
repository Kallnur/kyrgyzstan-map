import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import RecipientDetails from './RecipientDetails';
import Select from 'react-select';
import './SearchComponent.css';

const API_URL = process.env.REACT_APP_API_URL;

const fetchOptions = async (endpoint) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`);
    return response.data.results;
  } catch (error) {
    console.error(`Ошибка при получении данных с ${endpoint}:`, error);
    return [];
  }
};

const SearchComponent = () => {
  const [formValues, setFormValues] = useState({
    payment_status: '',
    nationality: '',
    gender: '',
    region: '',
    city: '',
    township: '',
    village: '',
    relative: '',
    search: '',
    pin: '',
    page: '',
    page_size: '',
    territorial_object: '',
    territorial_unit: ''
  });

  const [results, setResults] = useState([]);
  const [referenceData, setReferenceData] = useState({
    city: [],
    gender: [],
    nationality: [],
    region: [],
    territorialObject: [],
    territorialUnit: [],
    township: [],
    village: [],
    relativeType: [],
    paymentStatus: []
  });

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const fetchAllReferences = async () => {
      const city = await fetchOptions('/reference/ref_city/');
      const gender = await fetchOptions('/reference/ref_gender/');
      const nationality = await fetchOptions('/reference/ref_nationality/');
      const region = await fetchOptions('/reference/ref_region/');
      const territorialObject = await fetchOptions('/reference/ref_territorial_object/');
      const territorialUnit = await fetchOptions('/reference/ref_territorial_unit/');
      const township = await fetchOptions('/reference/ref_township/');
      const village = await fetchOptions('/reference/ref_village/');
      const relativeType = await fetchOptions('/reference/ref_relative_type/');
      const paymentStatus = await fetchOptions('/reference/ref_payment_status/');
      setReferenceData({ city, gender, nationality, region, territorialObject, territorialUnit, township, village, relativeType, paymentStatus });
    };
    fetchAllReferences();
  }, []);

  useEffect(() => {
    handleSubmit();
  }, [formValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSearchChange = (e, field) => {
    setFormValues({ ...formValues, [field]: e.target.value });

    if (field === 'pin' && e.target.value.length < 14 && e.target.value.length  > 0) {
      setPinError('ПИН не содержит 14 символов');
    } else {
      setPinError('');
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormValues({ ...formValues, [name]: selectedOption ? selectedOption.value : '' });
  };

  const handleSubmit = async () => {
    if (pinError) {
      return;
    }
    const query = Object.keys(formValues)
      .filter(key => formValues[key] !== '')
      .map(key => `${key}=${formValues[key]}`)
      .join('&');

    try {
      const response = await axios.get(`${API_URL}/recipient/recipient/?${query}`);
      setResults(response.data.results);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };

  const handleDetailsClick = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/recipient/recipient/${id}/`);
      setSelectedRecipient(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };

  const renderSelectOptions = (options) => {
    return options.map(option => ({
      value: option.id,
      label: option.name_ru
    }));
  };

  const getRegionNameById = (id) => {
    const region = referenceData.region.find(region => region.id === id);
    return region ? region.name_ru : 'N/A';
  };

  return (
    <div className="search-containerRlc">
      <div className="search-container">
        <div className='searchBtns'>
          <button className="btn" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
            {showAdvancedSearch ? 'Скрыть расширенный поиск' : 'Показать расширенный поиск'}
          </button>
        </div>
        <form className="search-form">
          {showAdvancedSearch && (
            <div className="grid-container">
              <div>
                <label>Национальность</label>
                <Select
                  name="nationality"
                  options={renderSelectOptions(referenceData.nationality)}
                  placeholder="Выбрать"
                  onChange={handleSelectChange}
                  isClearable
                />
              </div>
              <div>
                <label>Пол</label>
                <Select
                  name="gender"
                  options={renderSelectOptions(referenceData.gender)}
                  placeholder="Выбрать"
                  onChange={handleSelectChange}
                  isClearable
                />
              </div>
              <div>
                <label>Город</label>
                <Select
                  name="city"
                  options={renderSelectOptions(referenceData.city)}
                  placeholder="Выбрать"
                  onChange={handleSelectChange}
                  isClearable
                />
              </div>
              <div>
                <label>Поселок</label>
                <Select
                  name="township"
                  options={renderSelectOptions(referenceData.township)}
                  placeholder="Выбрать"
                  onChange={handleSelectChange}
                  isClearable
                />
              </div>
              <div>
                <label>Село</label>
                <Select
                  name="village"
                  options={renderSelectOptions(referenceData.village)}
                  placeholder="Выбрать"
                  onChange={handleSelectChange}
                  isClearable
                />
              </div>
              <div>
                <label>Территориальный объект</label>
                <Select
                  name="territorial_object"
                  options={renderSelectOptions(referenceData.territorialObject)}
                  placeholder="Выбрать"
                  onChange={handleSelectChange}
                  isClearable
                />
              </div>
              <div>
                <label>Территориальная единица</label>
                <Select
                  name="territorial_unit"
                  options={renderSelectOptions(referenceData.territorialUnit)}
                  placeholder="Выбрать"
                  onChange={handleSelectChange}
                  isClearable
                />
              </div>
              <div>
                <label>Родственник</label>
                <Select
                  name="relative"
                  options={renderSelectOptions(referenceData.relativeType)}
                  placeholder="Выбрать"
                  onChange={handleSelectChange}
                  isClearable
                />
              </div>
            </div>
          )}
        </form>
        <table className="results-table">
          <thead>
            <tr>
              <th className='specialTh'>№</th>
              <th className='specialTh'>ФИО
                <input
                  type="text"
                  placeholder="Поиск по ФИО"
                  className='specialInput'
                  onChange={(e) => handleSearchChange(e, 'search')}
                />
              </th>
              <th className='specialTh'>ПИН
                <input
                  type="text"
                  placeholder="Поиск по ПИН"
                  className='specialInput'
                  onChange={(e) => handleSearchChange(e, 'pin')}
                />
                {pinError && <div className="error-message">{pinError}</div>}
              </th>
              <th className='specialTh'>Область
                <Select
                  name="region"
                  options={renderSelectOptions(referenceData.region)}
                  placeholder="Выбрать область"
                  onChange={handleSelectChange}
                  isClearable
                />
              </th>
              <th className='specialTh'>Сумма платежа</th>
              <th className='specialTh'>Статус платежа
                <Select
                  name="payment_status"
                  options={renderSelectOptions(referenceData.paymentStatus)}
                  placeholder="Выбрать статус"
                  onChange={handleSelectChange}
                  isClearable
                />
              </th>
              <th className='specialTh'>Подробнее</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.id}>
                <td>{index + 1}</td>
                <td>{`${result.first_name} ${result.second_name} ${result.third_name}`}</td>
                <td>{result.pin}</td>
                <td>{getRegionNameById(result.address?.region)}</td>
                <td>{result.payment_sum}</td>
                <td>{result.payment_status ? result.payment_status.name_ru : 'N/A'}</td>
                <td>
                  <button className="details-button" onClick={() => handleDetailsClick(result.id)}>Посмотреть</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <RecipientDetails recipient={selectedRecipient} />
        </Modal>
      </div>
    </div>
  );
};

export default SearchComponent;
