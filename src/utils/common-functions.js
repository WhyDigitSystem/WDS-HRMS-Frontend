import apiCalls from 'apicall';

export const getCountryByOrgId = async (orgId) => {
  try {
    const response = await apiCalls('get', `/basicMaster/getCountryByOrgId?orgId=${orgId}`);

    console.log('API Response:', response);

    if (response) {
      const countryNameVO = response.paramObjectsMap.countryVO.map((country) => country.countryName);
      return countryNameVO;
    } else {
      // Handle error
      return [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const getStateByCountry = async (orgId, country) => {
  try {
    const response = await apiCalls('get', `/basicMaster/getAllStateByCountry?orgId=${orgId}&country=${country}`);

    if (response) {
      const countryNameVO = response.paramObjectsMap.stateVO.map((state) => state.stateName);
      return countryNameVO;
    } else {
      // Handle error

      return [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const getCityByState = async (orgId, state) => {
  try {
    const response = await apiCalls('get', `/basicMaster/getAllCityByState?orgid=${orgId}&state=${state}`);

    if (response) {
      const cityNameVO = response.paramObjectsMap.cityVO.map((city) => city.cityName);
      return cityNameVO;
    } else {
      // Handle error
      return [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const getCurrencyByOrgId = async (orgId) => {
  try {
    const response = await apiCalls('get', `/basicMaster/getCurrencyByOrgId?orgId=${orgId}`);

    if (response) {
      const currencyVO = response.paramObjectsMap.currencyVO.map((currency) => currency.currency);
      return currencyVO;
    } else {
      // Handle error
      return [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};
