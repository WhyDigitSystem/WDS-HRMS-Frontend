import apiCalls from 'apicall';

export const getAllActiveCountries = async (orgId) => {
  try {
    const response = await apiCalls('get', `commonmaster/country?orgid=${orgId}`);
    if (response.status === true) {
      const countryData = response.paramObjectsMap.countryVO
        .filter((row) => row.active === 'Active')
        .map(({ id, countryName, countryCode }) => ({ id, countryName, countryCode }));

      return countryData;
    } else {
      console.error('API Error:', response);
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const getAllActiveStatesByCountry = async (country, orgId) => {
  try {
    const response = await apiCalls('get', `commonmaster/state/country?country=${country}&orgid=${orgId}`);
    if (response.status === true) {
      const countryData = response.paramObjectsMap.stateVO
        .filter((row) => row.active === 'Active')
        .map(({ id, country, stateCode, stateName, stateNumber }) => ({ id, country, stateCode, stateName, stateNumber }));

      return countryData;
    } else {
      console.error('API Error:', response);
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const getAllActiveCitiesByState = async (state, orgId) => {
  try {
    const response = await apiCalls('get', `commonmaster/city/state?orgid=${orgId}&state=${state}`);
    if (response.status === true) {
      const cityData = response.paramObjectsMap.cityVO
        .filter((row) => row.active === 'Active')
        .map(({ id, cityName, cityCode }) => ({ id, cityName, cityCode }));

      return cityData;
    } else {
      console.error('API Error:', response);
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const getAllActiveCurrency = async (orgId) => {
  try {
    const response = await apiCalls('get', `commonmaster/currency?orgid=${orgId}`);
    if (response.status === true) {
      const currencyData = response.paramObjectsMap.currencyVO
        .filter((row) => row.active === 'Active')
        .map(({ id, currency, currencyDescription, subCurrency, country }) => ({
          id,
          currency,
          currencyDescription,
          subCurrency,
          country
        }));

      return currencyData;
    } else {
      console.error('API Error:', response);
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const getAllActiveEmployees = async (orgId) => {
  try {
    const response = await apiCalls('get', `warehousemastercontroller/getAllEmployeeByOrgId?orgId=${orgId}`);
    if (response.status === true) {
      const empData = response.paramObjectsMap.employeeVO
        .filter((row) => row.active === 'Active')
        .map(({ id, employeeName, employeeCode }) => ({ id, employeeName, employeeCode }));
      return empData;
    } else {
      console.error('API Error:');
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const getAllActiveUnits = async (orgId) => {
  try {
    const response = await apiCalls('get', `warehousemastercontroller/getAllUnitByOrgId?orgid=${orgId}`);
    if (response.status === true) {
      const unitData = response.paramObjectsMap.unitVO
        .filter((row) => row.active === 'Active')
        .map(({ id, unitName, unitType }) => ({ id, unitName, unitType }));
      return unitData;
    } else {
      console.error('API Error:');
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const getAllActiveRegions = async (orgId) => {
  try {
    const response = await apiCalls('get', `commonmaster/getAllRegionsByOrgId?orgId=${orgId}`);
    if (response.status === true) {
      const empData = response.paramObjectsMap.regionVO
        .filter((row) => row.active === 'Active')
        .map(({ id, regionName, regionCode }) => ({ id, regionName, regionCode }));
      return empData;
    } else {
      console.error('API Error:');
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const getAllActiveScreens = async () => {
  try {
    const response = await apiCalls('get', `/commonmaster/getAllScreenNames`);
    console.log('API Response:', response);

    if (response.status === true) {
      const screensData = response.paramObjectsMap.screenNamesVO
        .filter((row) => row.active === 'Active')
        .map(({ id, screenCode, screenName }) => ({ id, screenCode, screenName }));

      return screensData;
    } else {
      console.error('API Error:', response);
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};
export const getAllActiveRoles = async (orgId) => {
  try {
    const response = await apiCalls('get', `auth/allRolesByOrgId?orgId=${orgId}`);
    console.log('API Response:', response);

    if (response.status === true) {
      const rolesData = response.paramObjectsMap.rolesVO.filter((row) => row.active === 'Active').map(({ id, role }) => ({ id, role }));

      return rolesData;
    } else {
      console.error('API Error:', response);
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};
export const getAllActiveBranches = async (orgId) => {
  try {
    const response = await apiCalls('get', `master/branch?orgid=${orgId}`);
    console.log('API Response:', response);

    if (response.status === true) {
      const branchData = response.paramObjectsMap.branchVO
        .filter((row) => row.active === 'Active')
        .map(({ id, branch, branchCode }) => ({ id, branch, branchCode }));

      return branchData;
    } else {
      console.error('API Error:', response);
      return response;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const initCaps = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const numToWords = (num) => {
  const a = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const numberToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
    if (n < 1000000) return numberToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numberToWords(n % 1000) : '');
    return '';
  };

  return numberToWords(num);
};
