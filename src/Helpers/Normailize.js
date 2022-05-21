
export const getFormatedCountries = (counties) => {
    let result = [];
    try {
      counties.forEach((item) => {
        result.push({
          key: item.code,
          value: item.name,
          label: item.name,
        });
      });
      return result;
    } catch (err) {
      return result;
    }
  };
  
  