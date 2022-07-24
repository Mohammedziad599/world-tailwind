let searchTypingTimer;

let showingAllCountries = true;

let counteries = [];

let regionToFilterBy = {
  value: ""
};

let favouriteCountries = JSON.parse(localStorage.getItem("favouriteCountries")) || {};

// this filter is to work as a reflection
// so when the value of the filter changed
// it will update the page countent.
const filter = new Proxy(regionToFilterBy, {
  set: function (target, property, value) {
    Reflect.set(...arguments);
    // do the filtering
    createGridSkeleton();
    showCountries(counteries);
  }
});

let filterRegionElements = document.querySelectorAll("#filter-menu-dropdown li");

filterRegionElements.forEach(listItem => {
  listItem.onclick = setFilter;
});

document.addEventListener("dragstart", event => {
  console.log("drag start");
  console.log("event", event);
  event.target.classList.add("dragging");
  const cardElement = event.target;
  const imageElement = cardElement.querySelector("img");
  const nameElement = cardElement.querySelector('h3[aria-hidden="true"]');
  if (nameElement && imageElement && cardElement) {
    event.dataTransfer.setData("country-code", cardElement.getAttribute("data-country-code"));
    event.dataTransfer.setData("country-flag", imageElement.src);
    event.dataTransfer.setData("country-name", nameElement.innerText);
  }
});

document.addEventListener("dragend", event => {
  console.log("drag end");
  event.target.classList.remove("dragging");
});

const favouriteBox = document.querySelector("#fav-box");

favouriteBox.addEventListener("dragover", event => {
  event.preventDefault();
  favouriteBox.classList.add("dragover");
}, false);

favouriteBox.addEventListener("dragleave", event => {
  favouriteBox.classList.remove("dragover");
});

favouriteBox.addEventListener("drop", event => {
  event.preventDefault();
  const element = event.currentTarget;
  element.classList.remove("dragover");
  let countryCode = event.dataTransfer.getData("country-code");
  let countryFlag = event.dataTransfer.getData("country-flag");
  let countryName = event.dataTransfer.getData("country-name");
  console.log(countryCode)
  if (countryCode && countryFlag && countryName) {
    favouriteCountries[countryCode] = {
      flag: countryFlag,
      name: countryName,
      code: countryCode
    }
    updateFavouriteBox();
    localStorage.setItem("favouriteCountries", JSON.stringify(favouriteCountries));
  }
});

function updateFavouriteBox() {
  const favouriteList = document.getElementById("fav-list");
  let favHtml = "";
  Object.entries(favouriteCountries).forEach(([key, value]) => {
    favHtml += `
      <li class="flex items-center justify-between h-8 w-full">
        <a href="./country.html?code=${value.code}" class="flex items-center hover:dark:bg-gray-700 active:dark:bg-gray-600 px-2 rounded-md cursor-pointer">
          <img src="${value.flag}" alt="${value.name} Flag" class="h-4 w-8">
          <h3 class="text-lg pl-4 select-none whitespace-nowrap lg:w-32 xl:w-52 overflow-hidden">${value.name}</h3>
        </a>
        <span class="material-symbols-rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300
        dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500
        rounded-full text-xl leading-5 cursor-pointer select-none p-0.5" data-country-code="${value.code}" onclick="deleteFromFav(this)">
          close
        </span>
      </li>`;
  });
  favouriteList.innerHTML = favHtml;
}

function deleteFromFav(element) {
  let countryCode = element.getAttribute("data-country-code");
  delete favouriteCountries[countryCode];
  updateFavouriteBox();
  localStorage.setItem("favouriteCountries", JSON.stringify(favouriteCountries));
}

function toggleFav(event) {
  // let countryCode = element.getAttribute("data-country-code");
  event.preventDefault();
  const element = event.target;
  let countryCode = element.getAttribute("data-country-code");
  let countryFlag = element.getAttribute("data-country-flag");
  let countryName = element.getAttribute("data-country-name");

  if (countryCode && countryFlag && countryName) {
    if (favouriteCountries[countryCode]) {
      deleteFromFav(element);
      element.classList.remove("text-orange-500");
      element.classList.remove("dark:text-orange-500");
      element.classList.add("text-gray-300");
      element.classList.add("dark:text-gray-600");
    } else {
      favouriteCountries[countryCode] = {
        flag: countryFlag,
        name: countryName,
        code: countryCode
      }
      localStorage.setItem("favouriteCountries", JSON.stringify(favouriteCountries));
      updateFavouriteBox();
      element.classList.remove("text-gray-300");
      element.classList.remove("dark:text-gray-600");
      element.classList.add("text-orange-500");
      element.classList.add("dark:text-orange-500");
    }
  }

}

const searchInput = document.querySelector("#search");

searchInput.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    let searchValue = event.currentTarget.value.trim();
    if (searchValue.length === 0) {
      getAllCountries();
      return;
    }
    createGridSkeleton();
    fetch(`https://restcountries.com/v3.1/name/${searchValue}?fields=name,cca3,region,population,capital,flags`)
      .then(response => {
        if (response.ok)
          return response.json()
        throw new Error("No countries found");
      })
      .then(data => {
        let searchElement = document.getElementById("search");
        if (searchValue === searchElement.value.trim()) {
          counteries = data;
          showCountries(data);
          showingAllCountries = false;
        }
      })
      .catch(error => {
        console.error(error);
        let gridLayout = document.getElementById("grid");
        gridLayout.innerHTML = `
          <h1 class="text-5xl text-red-700 dark:text-red-400 col-span-full text-center">${error.message}</h1>
        `;
      });
  }
});

function setFilter(event) {
  let selectedFilter = event.currentTarget.innerHTML.trim();
  if (selectedFilter.normalize() === filter.value.normalize()) {
    selectedFilter = "";
    document.getElementById("current-filter").innerHTML = "Filter by";
  } else {
    document.getElementById("current-filter").innerHTML = `Filtered by ${selectedFilter}`;
  }
  filter.value = selectedFilter;
}

/**
 *
 * @param {*} data
 */
function showCountries(data) {
  if (Array.isArray(data)) {
    let gridInner = '';
    counteries = data;
    let filteredData = data;
    if (filter.value.length != 0) {
      if(filter.value === "Favourites"){
        filteredData = filteredData.filter(country=>{
          console.log(country);
          if(favouriteCountries[country.cca3]){
            return true;
          }
          return false;
        });
      }else{
        filteredData = filteredData.filter(country => {
          if (country.region.normalize() === filter.value.normalize()) {
            return true;
          }
          return false;
        });
      }
    }
    if (filteredData.length === 0) {
      let gridLayout = document.getElementById("grid");
      gridLayout.innerHTML = `
        <h1 class="text-5xl text-red-700 dark:text-red-400 col-span-full text-center">No Data Found</h1>
      `;
    }
    filteredData.forEach((element, index, array) => {
      let flag = element.flags.svg;
      let name = element.name.common;
      let population = element.population;
      let region = element.region;
      let capital = element.capital[0] || "No Capital";
      let code = element.cca3;
      let template = `
        <div class="mb-10">
          <a href="./country.html?code=${code}" data-country-code="${code}" class="card block bg-white text-black dark:bg-gray-800 rounded-lg shadow-lg
          dark:text-white overflow-hidden hover:transition-all ease-in-out duration-200 hover:scale-105">
            <img src="${flag}" alt="${name + " Flag"}" class="w-full h-fit lg:h-56 xl:h-56 2xl:h-48 object-cover dark:brightness-75 dark:contrast-125">
            <div class="card-body px-5 pt-5">
              <h3 class="text-xl font-semibold mb-4 with-popup hidden xl:block" aria-hidden="true"
                ${name.length > 25 ? 'data-toggle="popover" data-content="' + name + '"' : ""}>
                ${name.length > 25 ? name.substr(0, 24) + "&hellip;" : name}
              </h3>
              <h3 class="text-xl font-semibold mb-4 with-popup block xl:hidden xl:sr-only">
                ${name}
              </h3>
              <div class="mb-1">
                <span class="font-semibold mr-1">
                  Population:
                </span>
                ${population.toLocaleString('en-US')}
              </div>
              <div class="mb-1">
                <span class="font-semibold mr-1">
                  Region:
                </span>
                ${region}
              </div>
              <div class="mb-3">
                <span class="font-semibold mr-1">
                  Capital:
                </span>
                ${capital}
              </div>
              <div class="mb-2 flex lg:hidden justify-end">
                <span class="material-symbols-rounded ${favouriteCountries[code] ? "text-orange-500 dark:text-orange-500" : "text-gray-300 dark:text-gray-600"}"
                onclick="toggleFav(event)" data-country-code="${code}" data-country-flag="${flag}" data-country-name="${name}">
                  star
                </span>
              </div>
            </div>
          </a>
        </div>`;
      gridInner += template;
      if (index === array.length - 1) {
        let gridLayout = document.getElementById("grid");
        gridLayout.innerHTML = gridInner;
        let popoverTriggerList = [].slice.call(
          document.querySelectorAll('[data-toggle="popover"]')
        );
        popoverTriggerList.forEach((element) => {
          let content = element.getAttribute("data-content");
          tippy(element, {
            content: content,
            arrow: true,
            placement: "bottom-start",
          });
        });
      }
    });
  }
}


function createGridSkeleton() {
  let gridLayout = document.getElementById("grid");
  let skeleton = `
    <div class="mb-10">
      <div class="card block bg-white text-black dark:bg-gray-800 rounded-lg shadow-lg
        dark:text-white overflow-hidden">
        <div class="w-full h-80 lg:h-56 xl:h-56 2xl:h-48 object-cover bg-gray-200 dark:bg-gray-500 animate-pulse">
        </div>
        <div class="card-body px-5 pt-5 pb-10">
          <div class="mb-4 h-6 rounded bg-gray-200 dark:bg-gray-500 animate-pulse" aria-hidden="true">
          </div>
          <div class="mb-1 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-500 animate-pulse">
          </div>
          <div class="mb-1 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-500 animate-pulse">
          </div>
          <div class="mb-1 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-500 animate-pulse">
          </div>
        </div>
      </div>
    </div>`;
  gridLayout.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    gridLayout.innerHTML += skeleton;
  }
}

function getAllCountries() {
  createGridSkeleton();
  fetch("https://restcountries.com/v3.1/all?fields=name,cca3,region,population,capital,flags")
    .then((response) => {
      if (response.ok)
        return response.json()
      throw new Error("Error");
    })
    .then((data) => {
      showCountries(data);
      showingAllCountries = true;
    })
    .catch((error) => {
      console.error(error);
      let gridLayout = document.getElementById("grid");
      gridLayout.innerHTML = `
        <h1 class="text-5xl text-red-700 dark:text-red-400 col-span-full text-center">${error.message}</h1>
      `;
    });
}

getAllCountries();
updateFavouriteBox();