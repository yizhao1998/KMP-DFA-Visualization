import React from "react";
import "../style/Foot.css";
import SearchIndexWords from "../../constant/SearchIndexWords";

const Foot = () => {
	return (
		<>
			<div className="copyright">
				<p>
					License MIT Copyright © 2022{" "}
					<a href={"https://www.yizhao.tech/about?yi"}>Yi Zhao</a>{" "}
					contributor(s)
				</p>
				<a href="https://github.com/yizhao1998/KMP-DFA-Visualization">
					Github
				</a>
			</div>
			<div hidden>
				{SearchIndexWords.map((x, ind) => (
					<p key={ind}>{x}</p>
				))}
			</div>
		</>
	);
};

export default Foot;
