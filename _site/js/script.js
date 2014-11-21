// Set some variables
var width = parseInt(d3.select("#master_container").style("width")),
  height = width / 2;

var projection = d3.geo.albersUsa();

var path = d3.geo.path()
	.projection(projection);

var svg = d3.select("#map_container")
  .attr("width", width)
  .attr("height", height);

var radius = d3.scale.sqrt()  
			.domain([0, 1000])
			.range([(2), (width / 45)]); 

var legend = svg.append("g")
  .attr("class", "legend")    
  .selectAll("g")
	.data([500, 2000, 5000])
	.enter().append("g");

// var 80 = 80;              

// load some data
d3.json("js/us_93_02_v2.json", function(error, us) {
	if (error) return console.error(error);

	d3.json("js/offshore.json", function(error, offshore) {
		if (error) return console.error(error + "herro error in offshore");

		var data2 = topojson.feature(us, us.objects.us_10m).features
		// console.log(data2[0].properties)

		// for (var i = 0; i < data2[0].properties.length; i++) {
		// 	console.log(data2[0].properties)
		// };

		var typeArray = [[],[],[],[],[],[],[],[]];

		for (var datapoint in data2[0].properties){
		 	// if (datapoint == type) {
	 		// console.log(d.properties.name + " " + datapoint + ": " + d.properties[datapoint])
	 		// var raw = d.properties[datapoint] 		
	 		if (datapoint === "name") {
	 			typeArray[0].push(datapoint)
	 		}
		 	else if (datapoint.substring(2,0) == "to") {
	 			typeArray[1].push(datapoint)
	 		}
	 		else if (datapoint.substring(2,0) == "co") {
	 			typeArray[2].push(datapoint)
	 		}
	 		else if (datapoint.substring(2,0) == "cr") {
	 			typeArray[3].push(datapoint)
	 		}
	 		else if (datapoint.substring(2,0) == "na") {
	 			typeArray[4].push(datapoint)
	 		}
	 		else if (datapoint.substring(2,0) == "tr") {
	 			typeArray[5].push(datapoint)
	 		}
	 		else if (datapoint.substring(2,0) == "or") {
	 			typeArray[6].push(datapoint)
	 		}
	 		else if (datapoint.substring(2,0) == "nu") {
	 			typeArray[7].push(datapoint)
	 		};
	 	}

		//build a map outside of resize
		svg.selectAll(".state")
	    .data(topojson.feature(us, us.objects.us_10m).features)
	    .enter().append("path")
	      .attr("class", function(d) {return "state " + d.id; });

		svg.append("path")
	    .datum(topojson.mesh(us, us.objects.us_10m, function(a,b) {return a !== b;}))
	    .attr("class", "state-boundary");

		var bubblediv = svg.append("g")
			.attr("class", "bubbles")


			bubblediv.selectAll("circle")
				.data(topojson.feature(us, us.objects.us_10m).features)
				.enter().append("circle")
				.attr("class", "posB bubble")   

		// Resize function
		function resize() {
			// resize width
			var width = parseInt(d3.select("#master_container").style("width")),
		    height = width / 2;

		  // redifine the radius of circles
			var radius = d3.scale.sqrt()  
				.domain([0, 1000])
				.range([(2), (width / 45)]); 

			// resize projection
		  // Smaller viewport
			if (width <= 800) {
				projection
					.scale(width * 1.2)
					.translate([width / 2, ((height / 2) + 45)])             
			} else if (width <= 900) {
				projection
					.scale(width * 1.2)
					.translate([width / 2, ((height / 2) + 30)])             
			} 
			// full viewport
			else {
				projection
					.scale(width)
					.translate([width / 2, ((height / 2) + 10)])   
			};	    

			// create the legend
			legend.append("circle")

	    legend.append("text")
	      .attr("dy", "1.3em")
	      .text(d3.format(".1s"));

	    // legend.append("text")
	    //     .text("Btu")
	    //     .attr("transform", "translate(" + (width - (radius2(10000) + 10)) + "," + (height - 10) + ")");      

			legend        
				.attr("transform", "translate(" + (width - (radius(10000) + 10)) + "," + (height - 10) + ")");

	    legend.selectAll("circle")
	      .attr("cy", function(d) { return -radius(d); })
	      .attr("r", radius);

	    legend.selectAll("text")
	      .attr("y", function(d) { return -2 * radius(d); }); 

	    // resize paths of states
			svg.selectAll('path.state')
	    	.attr("d", path);

	  	svg.selectAll('path.state-boundary')
	  		.attr("d", path);

			BuildBubbles(width, type);
		}
		
		// Tooltips section goes here

		function BuildBubbles(w, type) {
			
			// redifine the radius of circles
			var radius = d3.scale.sqrt()  
				.domain([0, 1000])
				.range([(2), (w / 45)]); 

			var TheData = topojson.feature(us, us.objects.us_10m).features		
			// load offshore data, and below do the circle creation but with lat/long instead of a centroid-from-topo

			console.log(TheData)		

			var gulf = [(path.centroid(TheData[3])[0] + 10),path.centroid(TheData[3])[1]]
			// console.log(gulf)		

		// This is a loop
			svg.selectAll("circle.bubble")
	  		.data(TheData
	        .sort(function(a, b) {        
	        	return b.properties.total2012 - a.properties.total2012; 
	        }))
	      .attr("transform", function(d) { 

	        return "translate(" + path.centroid(d) + ")"; })
	      .attr("r", function(d) { 		
	      	// Set what we want to look at 
		 			for (var datapoint in d.properties){
				 	 	if (datapoint == type) {
				   		// console.log(d.properties.name + " " + datapoint + ": " + d.properties[datapoint])
				   		var raw = d.properties[datapoint]
				   	}
					}
	        return radius(raw)
	      })
	      .attr("text", function(d){ return d.properties.id});	

			svg.selectAll(".gu").data([]).exit().remove();

			// create the gulf coast div
			bubblediv.append("circle")
				.attr("class", "posB bubble gu")
	      .attr("transform", function(d) { 
	        return "translate(" + gulf + ")"; })
	      .attr("r", function(d) { 		
	    //   	// Set what we want to look at 
		 		// 	for (var datapoint in d.properties){
				 // 	 	if (datapoint == type) {
				 //   		// console.log(d.properties.name + " " + datapoint + ": " + d.properties[datapoint])
				 //   		var raw = d.properties[datapoint]
				 //   	}
					// }
	    //     return radius(raw)
	    return i
	      })
	      // .attr("text", function(d){ return d.properties.id});	

		}

		// begin looping stuff
		var num	= 20; //number of iterations, i.e. years
		
		var i = 0; // which year you are on
		var k = 1; // which type of data you are looking at (total vs crude, etc)
		// var type = "total2012";
		var j = 0;
		var type = typeArray[k][19]  // wher to start

		function start() {
			play = setInterval(mechanic,300);	

			// play = (function loopingFunction() {
		 //    mechanic();
		 //    clearTimeout(loopingFunction);
		 //    setTimeout(loopingFunction, 300);
			// })();
		}

		// what to do each iteration
		function mechanic() {
			
			// console.log(j)	
			rebuildLoop();
			
			i += 1;
			// run three times for now
			if (i ===num) {			
				clearInterval(play);		 
			}	
		}

		function rebuildLoop() {
			console.log(i)

			var type = typeArray[k][i]

			BuildBubbles(width,type)
		}
	  
	  // start looping
	  start(); 

	  d3.select(window).on('resize', resize); 
	  // d3.selectAll("circle.bubble").on('click', tooltip);

	  // initial run
	  resize(); 	    	

	}); //end offshore.json
}); //end states.json


