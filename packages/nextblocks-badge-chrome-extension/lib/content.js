// Function to add a button to the page
// Function to add a button inside the flex container
function addButton(contractAddress, isVerified) {
  // Step 1: Select the span element with the class "inline-flex space-x-2 h-7"
  const flexContainer = document.querySelector(".inline-flex.space-x-2.h-7");

  // Check if the container exists
  if (!flexContainer) {
    console.error("Flex container not found");
    return;
  }

  // Step 2: Create a new button element with better contrast
  const newButton = document.createElement("button");
  newButton.type = "button";
  if (isVerified) {
    newButton.className =
      "flex items-center text-white dark:text-black bg-neargreen rounded-full px-2 py-1.5 space-x-2 transition-all duration-200 ease-in-out";
    newButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="fill-current h-4 w-4">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-sm font-medium">Verified</span>
        `;

    newButton.onclick = () => {
      window.open(`https://example.com/${contractAddress}`, "_blank"); // Replace with the URL you want to open
    };
  } else {
    // add code here
    newButton.className =
      "flex items-center bg-[#FFC10740] border border-[#FFC10740] rounded-full px-2 py-1.5 space-x-2 transition-all duration-200 ease-in-out";
    newButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="fill-current h-4 w-4">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
          <span class="text-sm font-medium">Unverified</span>
        `;
  }

  // Step 3: Append the new button to the container
  flexContainer.appendChild(newButton);
}

// Function to extract contract address from the URL
function getContractAddress() {
  const url = window.location.href;
  const contractAddress = url.split("/").pop();
  return contractAddress;
}

// Function to call the NEAR API
async function callNearAPI(contractAddress) {
  try {
    // Example: Call NEAR API to get contract details (replace with your actual API endpoint)
    const response = await fetch(`https://jsonplaceholder.org/posts`);
    const data = await response.json();
    console.log("contractAddress", contractAddress);

    // // Check response and conditionally add button
    // if (data) {
    //   // Adjust condition based on actual response structure
    // }
    addButton(contractAddress, true);
  } catch (error) {
    console.error("API call failed:", error);
  }
}

// Function to run the logic after the page has loaded
function runScriptAfterPageLoad() {
  // Extract contract address and call the API
  const contractAddress = getContractAddress();
  callNearAPI(contractAddress);
}

// Run the function after the page has fully loaded
document.addEventListener("DOMContentLoaded", runScriptAfterPageLoad);
