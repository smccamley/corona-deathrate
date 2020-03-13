import fetch from "isomorphic-fetch"

const JSON_FILE_DB_KEY = process.env.JSON_FILE_DB_KEY
const JSON_DATA_ACCESS_URL = process.env.JSON_DATA_ACCESS_URL
const JSON_WHO_ACCESS_URL = process.env.JSON_WHO_ACCESS_URL

const cleanResponse = data => {
  let lastUpdated = 0
  let totalDeaths = 0
  let totalRecovered = 0
  let totalConfirmed = 0

  let newData = data.features.map(feature => {
    const attributes = feature.attributes
    const newAttributes = {
      deaths:
        typeof attributes.cum_death === "number" ? attributes.cum_death : 0,
      confirmed:
        typeof attributes.cum_conf === "number" ? attributes.cum_conf : 0,
      id: attributes.GlobalID,
      provinceOrState: attributes.ADM0_VIZ_NAME,
      lastUpdated: attributes.DateOfReport,
      lat: attributes.CENTER_LAT,
      long_: attributes.CENTER_LON,
    }

    if (newAttributes.lastUpdated > lastUpdated)
      lastUpdated = newAttributes.lastUpdated

    totalDeaths = totalDeaths + newAttributes.deaths
    totalConfirmed = totalConfirmed + newAttributes.confirmed
    totalRecovered = totalRecovered + newAttributes.recovered

    return newAttributes
  })

  return {
    totals: { lastUpdated, totalConfirmed, totalDeaths, totalRecovered },
    byCountry: newData,
  }
}

export default async (req, res) => {
  const data = await fetch(JSON_DATA_ACCESS_URL + "/latest", {
    method: "GET",
    headers: {
      "secret-key": JSON_FILE_DB_KEY,
      "Content-Encoding": "zlib",
    },
    compress: true,
  })
  const dataText = await data.text()
  let dataJSON = JSON.parse(dataText)

  const twoHours = 60 * 60 * 1000 * 2
  const now = new Date().valueOf()

  if (now > dataJSON.lastUpdated + twoHours) {
    const updatedData = await fetch(JSON_WHO_ACCESS_URL)
    const updatedDataJSON = await updatedData.json()

    if (updatedDataJSON) {
      updatedDataJSON.lastUpdated = now
      dataJSON = updatedDataJSON

      try {
        let result = await fetch(JSON_DATA_ACCESS_URL, {
          method: "PUT",
          body: JSON.stringify(dataJSON),
          headers: {
            "Content-Type": "application/json",
            "secret-key": JSON_FILE_DB_KEY,
          },
        })
      } catch (error) {
        console.log("error", error)
      }
    }
  }

  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(cleanResponse(dataJSON)))
}
