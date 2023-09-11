var templateCell_$PLUGIN_ID = document.createElement("template");
templateCell_$PLUGIN_ID.innerHTML = `
  <style>
    #container {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: space-between;
      height: 100%;
      width: calc(100% - 16px);
      padding: 0 8px;
    }
    input {
      height: 100%;
      flex: 1;
      background-color: transparent;
      border: 0;
      min-width: 0;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    input:focus {
      outline: none;
    }
  </style>
  <div id="container">
    <input type="text" id="content-value" placeholder="Drop an image here...">
  </div>
`;

class OuterbasePluginConfig_$PLUGIN_ID {
  constructor(object) {}
}

class OuterbasePluginCell_$PLUGIN_ID extends HTMLElement {
  static get observedAttributes() {
    return ["cellValue", "configuration"];
  }

  config = new OuterbasePluginConfig_$PLUGIN_ID({});

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(templateCell_$PLUGIN_ID.content.cloneNode(true));
  }

  connectedCallback() {
    this.config = new OuterbasePluginConfig_$PLUGIN_ID(
      JSON.parse(this.getAttribute("configuration"))
    );
    var cellValue = this.getAttribute("cellValue");
    this.shadow.querySelector("#content-value").value = cellValue;

    var container = this.shadow.getElementById("container");

    if (container) {
      container.addEventListener("dragover", (event) => {
        event.preventDefault();
      });

      container.addEventListener("drop", (event) => {
        event.preventDefault();
        var file = event.dataTransfer.files[0];
        this.uploadToCloudinary(file);
      });
    }
  }

  uploadToCloudinary(file) {
    // Storing the old URL before uploading to Cloudinary I have use this oldUrl to find id number of the row with a GET command
    const oldUrl = this.getAttribute("cellValue");

    // Replace these values with your own Cloudinary credentials
    var cloudName = "YOUR_CLOUD_NAME";
    var uploadPreset = "YOUR_UPLOAD_PRESET";

    // Create a new FormData object to hold the file to upload
    var formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    let secureUrl;

    // Call the Cloudinary API to upload the file
    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the cell with the Cloudinary URL
        this.callCustomEvent({
          action: "cellvalue",
          value: data.secure_url,
        });

        // Assign the secure_url to secureUrl
        secureUrl = data.secure_url;

        // Fetch the id using the old URL
        return fetch(
          `COMMAND_TO-GET_id-NUMBER OF THE ROW`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
            },
          }
        );
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.response.items.length > 0) {
          const id = data.response.items[0].id;
        //   console.log(id, "plugin fetch");
        //   console.log(secureUrl, "SECURE URL");

          // Send a PATCH request to change the src with the plugin
          fetch(
            "COMMAND_TO UPDATE_LINK_IN_DB",
            {
              method: "PUT",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                id: id.toString(),
                src: secureUrl,
              }),
            }
          );
        }
      });
  }

  callCustomEvent(data) {
    const event = new CustomEvent("custom-change", {
      detail: data,
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }
}

window.customElements.define(
  "outerbase-plugin-cell-$PLUGIN_ID",
  OuterbasePluginCell_$PLUGIN_ID
);