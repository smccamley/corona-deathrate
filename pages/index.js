import React, { useState, useEffect } from "react"
import Page from "../components/Page"
import { StyledBox, BorderBox } from "../components/StyledBoxes"
import Header from "../components/Header"
import styled from "styled-components"
import fetch from "isomorphic-fetch"
import Head from "next/head"
import { GlobalStyles } from "../components/GlobalStyles"
import Link from "next/link"

const Row = styled.div`
  flex-direction: row;
  display: flex;
  flex: 1;
  flex-basis: 100%;
  @media only screen and (max-width: 768px) {
    flex-direction: column;
  }
`

const Spacer = styled.div`
  width: 100%;
  height: 10px;
`

const ThirdStyledBox = styled(StyledBox)`
  flex: 1;
  text-align: center;
  margin: 10px;
  display: flex;
  flex-direction: column;
  @media only screen and (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
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
  @media only screen and (max-width: 768px) {
    margin-left: 10px;
  }
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

const References = styled.div`
  margin-top: 30px;
  margin-bottom: 30px;
`

const Ref = styled.sup`
  font-size: 10px;
`

const Reference = styled.div``

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const makeUIPercentage = percentage => {
  return (percentage * 100).toFixed(2) + " %"
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

      let totalEstimatedConfirmedPercentage =
        asymptomaticPercentage + misdiagnosedPercentage + untestedPercentage
      let totalConfirmedEstimated =
        totalConfirmed / ((100 - totalEstimatedConfirmedPercentage) / 100)
      setEstimatedDeathRate(totalDeaths / totalConfirmedEstimated)
    }
    return undefined
  }, [data, asymptomaticPercentage, untestedPercentage, untestedPercentage])

  useEffect(() => {
    let getDataOnLoad = async () => {
      const response = await fetch("/api/data")
      const json = await response.json()
      setData(json)
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

  if (!data)
    return (
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
          color: "white",
        }}
      >
        Loading...
      </div>
    )

  const { lastUpdated, totalConfirmed, totalDeaths } = data.totals

  return (
    <Page>
      <GlobalStyles />
      <Head>
        <title>COVID - 19 Death Rate</title>
      </Head>
      <Header />

      <StyledBox>
        We have all seen the{" "}
        <Link href="http://www.who.org">
          World Health Organisation's (WHO's)
        </Link>{" "}
        figures on COVID-19's death rate. <br />
        <br />
        The simple way they calculate this death rate is by dividing the number
        of deaths by the number of cases.
        <br />
        <br /> <b>This is wrong!</b>
        <br />
        <br /> It's acutally calculating the death rate,{" "}
        <u>
          assuming you get tested and confirmed in a medical institution that is
          correctly logging the stats with the WHO
        </u>
        . To calculate a death rate of the virus, you must also include the
        three percentages in the box below.
      </StyledBox>
      <Spacer />
      <BorderBox style={{ width: "90vw", padding: "10px 0px 0px 0px" }}>
        <span style={{ fontSize: "12px", paddingLeft: 10 }}>
          The percentage of people who get the virus and
        </span>
        <Row>
          <ThirdStyledBox>
            <div>
              <span>
                don't get sick<Ref>[1.1,1.2]</Ref>
              </span>
              <SmallSpan>(asymptomatic)</SmallSpan>
            </div>
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
          </ThirdStyledBox>
          <ThirdStyledBox>
            <div>
              <span>
                don't get tested<Ref>[2]</Ref>
              </span>
              <SmallSpan>(stay at home through it all)</SmallSpan>
            </div>
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
          </ThirdStyledBox>
          <ThirdStyledBox>
            <div>
              <span>
                are misdiagnosed<Ref>[3]</Ref>
              </span>
              <SmallSpan>(and so are not tested)</SmallSpan>
            </div>
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
          </ThirdStyledBox>
        </Row>
      </BorderBox>

      <Row>
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
            Using (deaths / confirmed cases):{" "}
            <span>{makeUIPercentage(totalDeaths / totalConfirmed)}</span>
          </DeathRateBox>
          <DeathRateBox>
            Using (deaths / confirmed estimated cases):{" "}
            <BigNumber style={{ color: "red" }}>
              {makeUIPercentage(estimatedDeathRate)}
            </BigNumber>
          </DeathRateBox>
        </BorderBox>
        <BorderBox>
          <span>Change death rates</span>
          <EstimateButton onClick={changeToHighEstimate}>
            {" "}
            Change to possible high estimate
          </EstimateButton>
          <EstimateButton onClick={changeToLowEstimate}>
            {" "}
            Change to possible low estimate
          </EstimateButton>
        </BorderBox>
      </Row>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          marginTop: "10px",
        }}
      >
        <span>WHO data last updated at</span>
        <span>{new Date(lastUpdated).toGMTString()}</span>
      </div>
      <References>
        <span>References</span>
        <Reference>
          (1.1) -{" "}
          <i>
            <Link href="https://www.livescience.com/how-deadly-is-coronavirus-covid-19.html">
              https://www.livescience.com/how-deadly-is-coronavirus-covid-19.html
            </Link>
          </i>
        </Reference>
        <Reference>
          (1.2) -{" "}
          <i>
            <Link href="https://wwwnc.cdc.gov/eid/article/22/6/15-1080_article">
              https://wwwnc.cdc.gov/eid/article/22/6/15-1080_article
            </Link>
          </i>
        </Reference>
        <Reference>
          (2) - <i>Currently unkown, not enough data</i>
        </Reference>
        <Reference>
          (3) -{" "}
          <i>
            <Link href="https://www.eurekalert.org/pub_releases/2020-03/arrs-wcs030520.php">
              https://www.eurekalert.org/pub_releases/2020-03/arrs-wcs030520.php
            </Link>
          </i>
        </Reference>
        Data sources:{" "}
        <Link href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports">
          WHO
        </Link>
        .
      </References>
    </Page>
  )
}

export default Home
