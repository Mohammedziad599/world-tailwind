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

const favouriteBox = document.querySelector("#fav-box");

favouriteBox.addEventListener("dragover", event => {
  event.preventDefault();
}, false);

favouriteBox.addEventListener("dragenter", event => {
  event.currentTarget.classList.add("dragover");
});

favouriteBox.addEventListener("dragleave", event => {
  event.currentTarget.classList.remove("dragover");
});

favouriteBox.addEventListener("drop", event => {
  event.preventDefault();
  const element = event.currentTarget;
  element.classList.remove("dragover");
  let countryCode = event.dataTransfer.getData("country-code");
  let countryFlag = event.dataTransfer.getData("country-flag");
  let countryName = event.dataTransfer.getData("country-name");
  favouriteCountries[countryCode] = {
    flag: countryFlag,
    name: countryName,
    code: countryCode
  }
  updateFavouriteBox();
  localStorage.setItem("favouriteCountries", JSON.stringify(favouriteCountries));
});

function updateFavouriteBox() {
  const favouriteList = document.getElementById("fav-list");
  let favHtml = "";
  Object.entries(favouriteCountries).forEach(([key, value]) => {
    favHtml += `
      <li class="flex items-center justify-between h-8 w-full">
        <a href="./country.html?code=${value.code}" class="flex items-center hover:dark:bg-gray-700 active:dark:bg-gray-600 px-2 rounded-md cursor-pointer">
          <img src="${value.flag}" alt="${value.name} Flag" class="h-4 w-8">
          <h3 class="text-lg pl-4 select-none">${value.name}</h3>
        </a>
        <span class="material-symbols-rounded text-red-400 cursor-pointer">
          cancel
        </span>
      </li>`;
  });
  favouriteList.innerHTML = favHtml;
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
    document.getElementById("current-filter").innerHTML = "Filter by region";
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
      filteredData = filteredData.filter(country => {
        if (country.region.normalize() === filter.value.normalize()) {
          return true;
        }
        return false;
      })
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
            <img src="${flag}" alt="${name + " Flag"}" class="w-full h-fit lg:h-48 xl:h-56 2xl:h-48 object-cover dark:brightness-75 dark:contrast-125">
            <div class="card-body px-5 pt-5 pb-10">
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
              <div class="mb-1">
                <span class="font-semibold mr-1">
                  Capital:
                </span>
                ${capital}
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

        //add drag event listenter
        let cardElements = document.querySelectorAll(".card");
        cardElements.forEach(card => {
          card.addEventListener("dragstart", event => {
            event.target.classList.add("dragging");
            const cardElement = event.currentTarget;
            const imageElement = cardElement.querySelector("img");
            const nameElement = cardElement.querySelector('h3[aria-hidden="true"]');
            event.dataTransfer.setData("country-code", cardElement.getAttribute("data-country-code"));
            event.dataTransfer.setData("country-flag", imageElement.src);
            event.dataTransfer.setData("country-name", nameElement.innerText);
          });
          card.addEventListener("dragend", event => {
            event.target.classList.remove("dragging");
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
        <div class="w-full h-80 lg:h-48 xl:h-56 2xl:h-48 object-cover bg-gray-200 dark:bg-gray-500 animate-pulse">
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