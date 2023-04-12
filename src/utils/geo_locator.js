import NodeGeocoder from "node-geocoder";
let options = {
  provider: "openstreetmap",
};

export const locateAddress = async (address) => {
  let geoCoder = NodeGeocoder(options);
  try {
    const result = await geoCoder.geocode(address);
    return result;
  } catch (error) {
    console.log(`error at locateAddress(): ${error}`);
  }
};
