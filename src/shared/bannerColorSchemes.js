export const BANNER_SCHEMES = {
  red: {
    backgroundColor: '#e91640',
    textColor: '#ffffff',
    borderColor: '#bb1133',
    name: 'Red Banner',
  },
  orange: {
    backgroundColor: '#ff9933',
    textColor: '#ffffff',
    borderColor: '#be660dff',
    name: 'Orange Banner',
  },
  green: {
    backgroundColor: '#2eb82e',
    textColor: '#ffffff',
    borderColor: '#1f7a1f',
    name: 'Green Banner',
  },
  blue: {
    backgroundColor: '#4d88ff',
    textColor: '#ffffff',
    borderColor: '#003399',
    name: 'Blue Banner',
  },
  lilac: {
    backgroundColor: '#d699ff',
    textColor: '#ffffff',
    borderColor: '#a64dff',
    name: 'Lilac Banner',
  },
};

export function getBannerSchemes(presetName) {
  return BANNER_SCHEMES[presetName] || BANNER_SCHEMES.green;
}
