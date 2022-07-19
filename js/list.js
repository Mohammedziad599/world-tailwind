let searchTypingTimer;

let showingAllCountries = true;

let counteries = [];

let regionToFilterBy = {
  value: ""
};

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
        let grid = document.getElementById("grid");
        grid.innerHTML = `
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
      grid.innerHTML = `
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
          <a href="./country.html?code=${code}" class="card block bg-white text-black dark:bg-gray-800 rounded-lg shadow-lg
          dark:text-white overflow-hidden hover:transition-all ease-in-out duration-200 hover:scale-105">
            <img src="${flag}" alt="${name + " Flag"}" class="w-full h-fit lg:h-72 xl:h-48 object-cover dark:brightness-75 dark:contrast-125">
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
        grid.innerHTML = gridInner;
        let popoverTriggerList = [].slice.call(
          document.querySelectorAll('[data-toggle="popover"]')
        );
        let popoverList = popoverTriggerList.forEach((element) => {
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
  let gridElement = document.getElementById("grid");
  let skeleton = `
    <div class="mb-10">
      <div class="card block bg-white text-black dark:bg-gray-800 rounded-lg shadow-lg
        dark:text-white overflow-hidden">
        <div class="w-full h-72 lg:h-72 xl:h-48 object-cover bg-gray-200 dark:bg-gray-500 animate-pulse">
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
  gridElement.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    gridElement.innerHTML += skeleton;
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
      grid.innerHTML = `
        <h1 class="text-5xl text-red-700 dark:text-red-400 col-span-full text-center">${error.message}</h1>
      `;
    });
}

getAllCountries();