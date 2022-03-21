import React, { useEffect, useState } from "react";
import { Button, TextField, Stack } from "@mui/material";
import "./Graph.css";
import D3Graph from '../util/D3Graph';

const createD3Graph = D3Graph;

const SimpleGraph = () => {
	const [inputValue, setInputValue] = useState("");

	useEffect(createD3Graph, []);

	const onInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const onDrawClick = () => {};

	return (
		<>
			<div className="graph-wrapper">
				<Stack direction="row" spacing={2}>
					<div className="inputWrapper">
						<TextField
							id="standard-basic"
							label="Input KMP String"
							variant="outlined"
							style={{ width: "15vw" }}
							value={inputValue}
							onChange={onInputChange}
						/>
					</div>
					<Button variant="contained" color="success">
						Draw
					</Button>
				</Stack>

				<div id="graph"></div>
			</div>
		</>
	);
};

export default SimpleGraph;
