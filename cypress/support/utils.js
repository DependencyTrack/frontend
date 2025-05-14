export function genAxiosResponse(responses) {
  return (url) => {
    console.log('axios stub for URL: ' + url);
    return Promise.resolve({
      data: responses[url],
    });
  };
}
