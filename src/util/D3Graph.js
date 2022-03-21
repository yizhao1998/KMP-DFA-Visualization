import * as d3 from "d3";
import "./D3Graph.css";

const D3Graph = (elementId = "graph", jsonData) => {
	// set the dimensions and margins of the graph
	const margin = { top: 20, right: 100, bottom: 20, left: 100 },
		width = 1000 - margin.left - margin.right,
		height = 450 - margin.top - margin.bottom;

	const strokeInit = 2;
	const strokeDeep = 6;

	const eleSelector = "#" + elementId;

	// remove all previous
	d3.select(eleSelector).selectAll("*").remove();

	// append the svg object to the body of the page
	const svg = d3
		.select(eleSelector)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("display", "block")
		.style("margin", "auto")
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	if (!jsonData) {
		// Read dummy data
		d3.json(process.env.PUBLIC_URL + "/mock/data.json").then(render);
	} else {
		render(jsonData);
	}

	function render(data) {
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

		const linkLabels = svg
			.selectAll("myLinkLables")
			.data(data.links)
			.enter()
			.append("text")
			.attr("x", (d) => {
				let start = x(idToNode[d.source].name); // X position of start node on the X axis
				let end = x(idToNode[d.target].name); // X position of end node
				return (end - start) / 2 + start;
			})
			.attr("y", (d) => {
				let start = x(idToNode[d.source].name); // X position of start node on the X axis
				let end = x(idToNode[d.target].name); // X position of end node
				if (d.type === "forward") {
					return height - 35;
				} else {
					return height - (start - end) / 2 - 35;
				}
			})
			.text((d) => d.desc)
			.style("fill", "black")
			.style("text-anchor", "middle");

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

		const selfLinkLabels = svg
			.selectAll("mySelfLinkLabels")
			.data(data.selfLinks)
			.enter()
			.append("text")
			.attr("x", (d) => x(idToNode[d.node].name))
			.attr("y", (d) => height - 30 - d.radius * 2 - 5)
			.text((d) => d.desc)
			.style("fill", "black")
			.style("text-anchor", "middle");

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
			.attr("y", height - 23)
			.text((d) => d.name)
			.style("fill", "black")
			.style("text-anchor", "middle");

		// nodes listen to event
		function nodeMouseOverHighlight(d) {
			// Highlight the nodes: every node is green except of him
			nodes.style("fill", (e) => (e.id === d.id ? "#69b3b2" : "#B8B8B8"));
			// labels.style("fill", (e) => (e.id === d.id ? "black" : "#B8B8B8"));
			// Highlight the connections
			// only link start from this node is highlighted
			links
				.style("stroke", (a) =>
					a.source === d.id ? "#69b3b2" : "#b8b8b8"
				)
				.style("stroke-width", (a) =>
					a.source === d.id ? strokeDeep : strokeInit
				);
			selfLinks
				.style("stroke", (a) =>
					a.node === d.id ? "#69b3b2" : "#b8b8b8"
				)
				.style("stroke-width", (a) =>
					a.node === d.id ? strokeDeep : strokeInit
				);
			linkLabels.style("fill", (e) =>
				e.source === d.id ? "black" : "#B8B8B8"
			);
			selfLinkLabels.style("fill", (e) =>
				e.node === d.id ? "black" : "#B8B8B8"
			);
		}

		function nodeMouseLeaveDeHighlight(d) {
			nodes.style("fill", "#69b3a2");
			links.style("stroke", "black").style("stroke-width", strokeInit);
			selfLinks
				.style("stroke", "green")
				.style("stroke-width", strokeInit);
			linkLabels.style("fill", "black");
			selfLinkLabels.style("fill", "black");
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
			links
				.style("stroke", (e) =>
					e.source === d.source && e.target === d.target
						? "#69b3b2"
						: "#B8B8B8"
				)
				.style("stroke-width", (e) =>
					e.source === d.source && e.target === d.target
						? strokeDeep
						: strokeInit
				);
			selfLinks
				.style("stroke", (e) =>
					e.node === d.node ? "#69b3b2" : "#B8B8B8"
				)
				.style("stroke-width", (e) => (e.node === d.node ? strokeDeep : strokeInit));
			linkLabels.style("fill", (e) =>
				e.source === d.source && e.target === d.target
					? "#69b3b2"
					: "#B8B8B8"
			);
			selfLinkLabels.style("fill", (e) =>
				e.node === d.node ? "#69b3b2" : "#B8B8B8"
			);
			// highlight the nodes
			nodes.style("fill", (node) =>
				node.id === d.source ||
				node.id === d.target ||
				node.id === d.node
					? "#69b3b2"
					: "#B8B8B8"
			);
		}

		function linkMouseLeaveDeHighlight(d) {
			nodes.style("fill", "#69b3a2");
			links.style("stroke", "black").style("stroke-width", strokeInit);
			selfLinks
				.style("stroke", "green")
				.style("stroke-width", strokeInit);
			linkLabels.style("fill", "black");
			selfLinkLabels.style("fill", "black");
		}

		// links and selfLinks both listen to the mouse over and mouse out event
		[links, selfLinks, linkLabels, selfLinkLabels].forEach((x) => {
			x.on("mouseover", function (event, d) {
				linkMouseOverHighlight.call(this, d);
			}).on("mouseout", function (event, d) {
				linkMouseLeaveDeHighlight(d);
			});
		});
	}

	return svg;
};

export default D3Graph;
