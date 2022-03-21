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
				<div className="main-header">
					<Header />
				</div>
				<div>
					<Body />
				</div>
				<div>
					<Foot />
				</div>
			</Stack>
		</>
	);
};

export default MainPage;
