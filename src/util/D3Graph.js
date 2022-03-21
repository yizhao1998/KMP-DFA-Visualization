import * as d3 from "d3";

export default () => {
	// set the dimensions and margins of the graph
	const margin = { top: 20, right: 100, bottom: 20, left: 100 },
		width = 1000 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	const svg = d3
		.select("#graph")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("display", "block")
		.style("margin", "auto")
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Read dummy data
	d3.json(process.env.PUBLIC_URL + "/mock/data.json").then(function (data) {
		// List of node names
		var allNodes = data.nodes.map((d) => d.name);

		// A linear scale to position the nodes on the X axis
		var x = d3.scalePoint().range([0, width]).domain(allNodes);

		// Add links between nodes. Here is the tricky part.
		// In my input data, links are provided between nodes -id-, NOT between node names.
		// So I have to do a link between this id and the name
		var idToNode = {};
		data.nodes.forEach((node) => (idToNode[node.id] = node));
		// Cool, now if I do idToNode["2"].name I've got the name of the node with id 2

		// Add the links
		const links = svg
			.selectAll("mylinks")
			.data(data.links)
			.enter()
			.append("path")
			.attr("d", function (d) {
				let start = x(idToNode[d.source].name); // X position of start node on the X axis
				let end = x(idToNode[d.target].name); // X position of end node
				if (d.type === "backward") {
					return [
						"M",
						start,
						height - 30, // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
						"A", // This means we're gonna build an elliptical arc
						(start - end) / 2,
						",", // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
						(start - end) / 2,
						0,
						0,
						",",
						start < end ? 1 : 0,
						end,
						",",
						height - 30,
					] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
						.join(" ");
				} else {
					// by default the link is forward
					return [
						"M",
						start,
						height - 30, // the direct line starts at the coordinate x=start, y=height-30 (where the starting node is)
						"L", // This means we're gonna build a direct line
						end,
						",",
						height - 30,
					].join(" ");
				}
			})
			.style("fill", "none")
			.attr("stroke", "black");

		// the bottom point of the self link circle
		const bottom = height - 30;
		const initRadius = 20;
		const increment = 15;
		let radiusMap = {};
		data.selfLinks.forEach((link) => {
			if (!(link.node in radiusMap)) {
				radiusMap[link.node] = initRadius;
			} else {
				radiusMap[link.node] += increment;
			}
			link.radius = radiusMap[link.node];
		});

		const selfLinks = svg
			.selectAll("mySelfLinks")
			.data(data.selfLinks)
			.enter()
			.append("circle")
			.attr("cx", (d) => x(idToNode[d.node].name))
			.attr("cy", (d) => bottom - d.radius)
			.attr("r", (d) => d.radius)
			.style("stroke", "green")
			.style("fill", "none");

		// put nodes at last, to cover the external parts
		// Add the circle for the nodes
		const nodes = svg
			.selectAll("mynodes")
			.data(data.nodes)
			.enter()
			.append("circle")
			.attr("cx", (d) => x(d.name))
			.attr("cy", height - 30)
			.attr("r", 15)
			.style("fill", "#69b3a2");

		// And give them a label
		const labels = svg
			.selectAll("mylabels")
			.data(data.nodes)
			.enter()
			.append("text")
			.attr("x", (d) => x(d.name))
			.attr("y", height - 25)
			.text((d) => d.name)
			.style("text-anchor", "middle")
			.style("z-index", "3");

		// nodes listen to event
		function nodeMouseOverHighlight(d) {
			// Highlight the nodes: every node is green except of him
			nodes.style("fill", "#B8B8B8");
			if (this.tagName === "circle") {
				d3.select(this).style("fill", "#69b3b2");
			}
			// Highlight the connections
			// only link start from this node is highlighted
			links
				.style("stroke", (a) =>
					a.source === d.id ? "#69b3b2" : "#b8b8b8"
				)
				.style("stroke-width", (a) => (a.source === d.id ? 4 : 1));
			selfLinks
				.style("stroke", (a) =>
					a.node === d.id ? "#69b3b2" : "#b8b8b8"
				)
				.style("stroke-width", (a) => (a.node === d.id ? 4 : 1));
		}

		function nodeMouseLeaveDeHighlight(d) {
			nodes.style("fill", "#69b3a2");
			links.style("stroke", "black").style("stroke-width", "1");
			selfLinks.style("stroke", "green").style("stroke-width", "1");
		}

		// nodes and labels both listen to the mouse over and mouse out event
		[nodes, labels].forEach((x) => {
			x.on("mouseover", function (event, d) {
				nodeMouseOverHighlight.call(this, d);
			}).on("mouseout", function (event, d) {
				nodeMouseLeaveDeHighlight(d);
			});
		});

		// links listen to event
		function linkMouseOverHighlight(d) {
			// Highlight the nodes: every node is green except of him
			links.style("stroke", "#B8B8B8");
			selfLinks.style("stroke", "#B8B8B8");
			d3.select(this)
				.style("stroke", "#69b3b2")
				.style("stroke-width", "4");
			// highlight the nodes
			nodes.style("fill", (node) =>
				node.id == d.source || node.id === d.target || node.id === d.node
					? "#69b3b2"
					: "#B8B8B8"
			);
		}

		function linkMouseLeaveDeHighlight(d) {
			nodes.style("fill", "#69b3a2");
			links.style("stroke", "black").style("stroke-width", "1");
			selfLinks.style("stroke", "green").style("stroke-width", "1");
		}

		// links and selfLinks both listen to the mouse over and mouse out event
		[links, selfLinks].forEach((x) => {
			x.on("mouseover", function (event, d) {
				linkMouseOverHighlight.call(this, d);
			}).on("mouseout", function (event, d) {
				linkMouseLeaveDeHighlight(d);
			});
		});
	});
};
