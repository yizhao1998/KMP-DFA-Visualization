import { Stack } from "@mui/material";
import React from "react";
import "../style/MainPage.css";
import Body from "./Body";
import Foot from "./Foot";
import Header from "./Header";

const MainPage = () => {
	return (
		<>
			<Stack spacing={2}>
				<div className="main-header flex-center-flex1">
					<Header />
				</div>
				<div className="main-body flex-center-flex1">
					<Body />
				</div>
				<div className="main-foot flex-center-flex1">
					<Foot />
				</div>
			</Stack>
		</>
	);
};

export default MainPage;
