import React from "react"
import styled from "styled-components"

const Header = styled.header`
  width: 90vw;
  margin: 0 auto;
  padding: 1em 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h1`
  font-size: var(--step-up-2);
  padding: 5px 10px;
  border: 1px solid rgba(64, 64, 64, 0.7);
  background-color: rgba(64, 64, 64, 0.4);
  letter-spacing: 0.06em;
`

const Menu = styled.ul`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 50vw;
`

const MenuLink = styled.li`
  margin-left: 2em;
  text-decoration: none;
`

export default () => (
  <Header>
    <Title>
      Coronavirus COVID-19 Real time <b>deathrate</b>
    </Title>
  </Header>
)
