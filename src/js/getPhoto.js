const axios = require('axios').default;

export default async function getPhoto(search, page = 1) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=13230076-6d393faca736dd5a90699a632&q=${search}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`,
    );
    return response;
  } catch (error) {
    console.error(error);
  }
}
