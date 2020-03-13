import React, { useState, useEffect } from "react"
import Page from "../components/Page"
import { StyledBox, BorderBox } from "../components/StyledBoxes"
import Header from "../components/Header"
import styled from "styled-components"
import fetch from "isomorphic-fetch"
import Head from "next/head"
import { GlobalStyles } from "../components/GlobalStyles"
import cache from "../db/jsonResponseCache.json"
import Link from "next/link"

const Row = styled.div`
  flex-direction: row;
  display: flex;
  width: 100%;
`

const Spacer = styled.div`
  width: 100%;
  height: 10px;
`

const QuarterStyledBox = styled(StyledBox)`
  width: 33%;
  text-align: center;
  margin: 10px;
  display: flex;
  flex-direction: column;
`
const PercentageInput = styled.input`
  text-align: center;
  width: 45px;
  height: 30px;
  margin: 0 auto;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: bold;
`

const Percentage = styled.span`
  font-size: 18px;
  margin-left: 5px;
`
const SmallSpan = styled.span`
  margin-top: 4px;
  display: block;
  font-size: 10px;
`

const BigNumber = styled.span`
  display: block;
  font-size: 35px;
`

const DeathRateBox = styled.div`
  padding: 10px;
`

const EstimateButton = styled.button`
  padding: 5px;
  margin: 5px;
  display: block;
  width: 80%;
`

const References = styled.div``

const Reference = styled.div``

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const makeUIPercentage = percentage => {
  return (percentage * 100).toFixed(2) + " %"
}

const getDataFromJhuEdu = async () => {
  if (cache) {
    return cache
  }
  const response = await fetch(
    "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=(Confirmed%20%3E%200)%20OR%20(Deaths%3E0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Deaths%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&outSR=102100&resultOffset=0&resultRecordCount=250&cacheHint=true",
  )
  const json = await response.json()
  console.log(json)
  return json
}

const Home = () => {
  let [data, setData] = useState(null)
  let [asymptomaticPercentage, setAsymptomaticPercentage] = useState(
    (5.2 + 35.5) / 2,
  ) // 22.95
  let [untestedPercentage, setUntestedPercentage] = useState(5)
  let [misdiagnosedPercentage, setMisdiagnosedPercentage] = useState(3.9)

  let [estimatedDeathRate, setEstimatedDeathRate] = useState()

  useEffect(() => {
    if (data) {
      const { totalConfirmed, totalDeaths } = data.totals

      console.log(
        asymptomaticPercentage,
        misdiagnosedPercentage,
        untestedPercentage,
      )

      let totalEstimatedConfirmedPercentage =
        asymptomaticPercentage + misdiagnosedPercentage + untestedPercentage
      console.log(totalEstimatedConfirmedPercentage)
      let totalConfirmedEstimated =
        totalConfirmed / ((100 - totalEstimatedConfirmedPercentage) / 100)
      setEstimatedDeathRate(totalDeaths / totalConfirmedEstimated)
    }
    return undefined
  }, [data, asymptomaticPercentage, untestedPercentage, untestedPercentage])

  useEffect(() => {
    let getDataOnLoad = async () => {
      let data = await getDataFromJhuEdu()
      let lastUpdated = 0
      let totalDeaths = 0
      let totalRecovered = 0
      let totalConfirmed = 0

      let newData = data.features.map(feature => {
        const attributes = feature.attributes
        const newAttributes = {
          deaths: typeof attributes.Deaths === "number" ? attributes.Deaths : 0,
          recovered:
            typeof attributes.Recovered === "number" ? attributes.Recovered : 0,
          confirmed:
            typeof attributes.Confirmed === "number" ? attributes.Confirmed : 0,
          id: attributes.OBJECTID,
          provinceOrState: attributes.Province_State,
          countryOrRegion: attributes.Country_Region,
          lastUpdated: attributes.Last_Update,
          lat: attributes.Lat,
          long_: attributes.Long_,
        }

        if (newAttributes.lastUpdated > lastUpdated)
          lastUpdated = newAttributes.lastUpdated

        totalDeaths = totalDeaths + newAttributes.deaths
        totalConfirmed = totalConfirmed + newAttributes.confirmed
        totalRecovered = totalRecovered + newAttributes.recovered

        return newAttributes
      })

      const totalsAndOriginalData = {
        totals: { lastUpdated, totalConfirmed, totalDeaths, totalRecovered },
        byCountry: newData,
      }

      setData(totalsAndOriginalData)
    }
    getDataOnLoad()
  }, [])

  const changeToHighEstimate = () => {
    setAsymptomaticPercentage(5.2)
    setUntestedPercentage(5)
    setMisdiagnosedPercentage(1)
  }
  const changeToLowEstimate = () => {
    setAsymptomaticPercentage(50)
    setUntestedPercentage(15)
    setMisdiagnosedPercentage(3.9)
  }

  if (!data) return <div> Loading...</div>

  const { lastUpdated, totalConfirmed, totalDeaths } = data.totals

  return (
    <Page>
      <GlobalStyles />
      <Head>
        <title>COVID - 19 Death Rate</title>
      </Head>
      <Header />

      <StyledBox>
        We have all seen WHO's figures on COVID-19's death rate. The simple way
        they calculate this death rate is by dividing the number of deaths by
        the number of cases. This is wrong! It's a poor interpretation of the
        data for the sake of determining a death rate. They have ignored:
      </StyledBox>
      <Spacer />
      <BorderBox style={{ width: "90vw", padding: "10px 0px 0px 0px" }}>
        <span style={{ fontSize: "12px", paddingLeft: 10 }}>
          The percentage of people who get the virus and
        </span>
        <Row>
          <QuarterStyledBox>
            <span>
              don't get sick<span>(3)</span>
            </span>
            <SmallSpan>(asymptomatic)</SmallSpan>
            <div>
              <PercentageInput
                value={asymptomaticPercentage}
                onChange={event =>
                  setAsymptomaticPercentage(parseFloat(event.target.value))
                }
                type={"number"}
              />{" "}
              <Percentage>%</Percentage>
            </div>
          </QuarterStyledBox>
          <QuarterStyledBox>
            <span>
              don't get tested<span>(3)</span>
            </span>
            <SmallSpan>(stay at home through it all)</SmallSpan>
            <div>
              <PercentageInput
                value={untestedPercentage}
                onChange={event =>
                  setUntestedPercentage(parseFloat(event.target.value))
                }
                type={"number"}
              />{" "}
              <Percentage>%</Percentage>
            </div>
          </QuarterStyledBox>
          <QuarterStyledBox>
            <span>
              are misdiagnosed<span>(3)</span>
            </span>
            <SmallSpan>(and so are not tested)</SmallSpan>
            <div>
              <PercentageInput
                value={misdiagnosedPercentage}
                onChange={event =>
                  setMisdiagnosedPercentage(parseFloat(event.target.value))
                }
                type={"number"}
              />{" "}
              <Percentage>%</Percentage>
            </div>
          </QuarterStyledBox>
        </Row>
      </BorderBox>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div>
          <BorderBox>
            Current number of confirmed cases worldwide
            <BigNumber>{numberWithCommas(totalConfirmed)}</BigNumber>
          </BorderBox>
          <BorderBox>
            Current number of deaths worldwide
            <BigNumber>{numberWithCommas(totalDeaths)}</BigNumber>
          </BorderBox>
        </div>
        <BorderBox>
          <span>Death Rates</span>
          <DeathRateBox>
            Using (Deaths / confirmed cases):{" "}
            <span>{makeUIPercentage(totalDeaths / totalConfirmed)}</span>
          </DeathRateBox>
          <DeathRateBox>
            Using (Deaths / confirmed estimated cases):{" "}
            <BigNumber style={{ color: "red" }}>
              {makeUIPercentage(estimatedDeathRate)}
            </BigNumber>
          </DeathRateBox>
        </BorderBox>
        <BorderBox>
          <span>Change death rates</span>
          <EstimateButton onClick={changeToHighEstimate}>
            {" "}
            Change to posible high estimate
          </EstimateButton>
          <EstimateButton onClick={changeToLowEstimate}>
            {" "}
            Change to posible low estimate
          </EstimateButton>
        </BorderBox>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <span>Last Updated at</span>
        <span>{new Date(lastUpdated).toGMTString()}</span>
      </div>
      <References>
        <span>References</span>
        <Reference>
          (1.1) -{" "}
          <i>
            https://www.livescience.com/how-deadly-is-coronavirus-covid-19.html
          </i>
        </Reference>
        <Reference>
          (1.2) - <i>https://wwwnc.cdc.gov/eid/article/22/6/15-1080_article</i>
        </Reference>
        <Reference>
          (2) - <i>Currently unkown, not enough data</i>
        </Reference>
        <Reference>
          (3) -{" "}
          <i>
            https://www.eurekalert.org/pub_releases/2020-03/arrs-wcs030520.php
          </i>
        </Reference>
        Data sources:{" "}
        <Link href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports">
          WHO
        </Link>
        ,{" "}
        <Link href="https://www.cdc.gov/coronavirus/2019-ncov/index.html">
          CDC
        </Link>
        ,{" "}
        <Link href="https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases">
          ECDC
        </Link>
        , <Link href="http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml">NHC</Link>{" "}
        and{" "}
        <Link href="https://ncov.dxy.cn/ncovh5/view/pneumonia?scene=2&clicktime=1579582238&enterid=1579582238&from=singlemessage&isappinstalled=0">
          DXY
        </Link>{" "}
        and local media reports.
      </References>
    </Page>
  )
}

export default Home
