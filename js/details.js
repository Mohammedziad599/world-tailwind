//Reading the country code cca3
let params = new URLSearchParams(location.search);
let countryCode = params.get("code");

async function showCountryDetails(data) {
  const nativeName = data.name.nativeName[Object.keys(data.name.nativeName)[0]].common

  const currencies = Object.keys(data.currencies).map(key=>{
    return data.currencies[key].name;
  });
  const languages = Object.keys(data.languages).map(key=>{
    return data.languages[key];
  });
  const borders = [];
  for(const countryCode of data.borders){
    try{
      let data = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}?fields=name`);
      data = await data.json();
      borders.push([countryCode, data.name.common]);
    }catch(error){
      console.error(error);
    }
  }
  let borderButtons = borders.map(border=>{
    let buttonHtml = `<a href="./country.html?code=${border[0]}"
      class="bg-white px-4 mx-1 text-black hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300 border-box my-1 md:my-1
      dark:bg-gray-800 dark:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600 dark:active:bg-gray-500 py-2 shadow-md w-fit rounded">
      ${border[1]}
    </a>`;
    return buttonHtml;
  });

  let detailsTemplate = `
    <div>
    <img src="${data.flags.svg}" alt="${data.name.common} Flag" class="rounded drop-shadow-lg w-full dark:brightness-75 dark:contrast-125">
    </div>
    <div class="py-3">
      <h3 class="text-3xl font-extrabold">${data.name.common}</h3>
      <section class="flex w-full flex-col md:flex-row justify-between py-5" aria-label="Country Details">
        <div class="my-4">
          <div class="my-1"><span class="font-semibold">Native Name:</span> ${nativeName}</div>
          <div class="my-1"><span class="font-semibold">Population:</span> ${data.population.toLocaleString('en-US')}</div>
          <div class="my-1"><span class="font-semibold">Region:</span> ${data.region}</div>
          <div class="my-1"><span class="font-semibold">Sub Region:</span> ${data.subregion}</div>
          <div class="my-1"><span class="font-semibold">Capital:</span> ${data.capital.join(", ")}</div>
        </div>
        <div class="my-4">
          <div class="my-1"><span class="font-semibold">Top Level Domain:</span> ${data.tld.join(" & ")}</div>
          <div class="my-1"><span class="font-semibold">Currencies:</span> ${currencies.join(", ")}</div>
          <div class="my-1"><span class="font-semibold">Languages:</span> ${languages.join(", ")}</div>
        </div>
      </section>
      <section aria-label="Country Borders">
        <div class="flex flex-col md:flex-row py-10">
          <div class="flex justify-start md:justify-start flex-wrap">
            <span class="font-semibold flex items-center w-full lg:w-fit py-2 mr-2">Border Counteries:</span>
            ${borderButtons.join("")}
          </div>
        </div>
      </section>
    </div>`;
    let detailsElement = document.querySelector("#details");
    detailsElement.innerHTML = detailsTemplate;
}

function fetchCountryDetails(code) {
  fetch(`https://restcountries.com/v3.1/alpha/${code}?fields=flags,name,population,region,subregion,capital,tld,currencies,languages,borders`)
    .then(response => response.json())
    .then(data => showCountryDetails(data))
    .catch(error => console.error(error));
}

fetchCountryDetails(countryCode);