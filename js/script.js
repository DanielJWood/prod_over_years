// (function ($) { 
// 		//Populate select dropdown menu
// 		var mySelect = $('#mySelect');
// 		    $.each(data, function(i) {
// 		      mySelect.append(
// 		        $('<option></option>').val(data[i].stateabbrev).html(data[i].state)
// 		    );
// 		});
// }(jQuery));  


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

// load some data
d3.json("js/us_93_02_v2.json", function(error, us) {
	if (error) return console.error(error);

	var TheData = topojson.feature(us, us.objects.us_10m).features		

	d3.json("js/offshore.json", function(error, offshore) {
		if (error) return console.error(error + "herro error in offshore");

		var data2 = topojson.feature(us, us.objects.us_10m).features

		var typeArray = [[],[],[],[],[],[],[],[]];

		for (var datapoint in data2[0].properties){
	
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



			d3.selectAll(".lg").remove();
			d3.selectAll("#slider").remove();
			d3.selectAll(".sly1").remove();

			// resize width
			var width = parseInt(d3.select("#master_container").style("width")),
		    height = width / 2;

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

			var margin	= width / 20;
			var top = 10;
			var left = margin;
			var barWidth = width - margin*2;

			var sliderContainer = svg.append("g")
      .attr("id", "slider")
      .attr("class", "sly1")
      .append("rect")
        // .attr("id", "tooltip")
        .attr("transform", function() { 
          return "translate("+ left + ","+ top +")"; })
        .attr("width", barWidth)
        .attr("height", (2))

      svg.append("g")
      	.attr("id", "sliderTick")
      	.attr("class", "sly1")
      	.append("rect")
					.attr("transform", function() { 
	          return "translate("+ left + ","+ top +")"; })
	        .attr("width", 2)
	        .attr("height", 6);

	    svg.append("g")
      	.attr("id", "sliderTick2")
      	.attr("class", "sly1")
      	.append("rect")
					.attr("transform", function() { 
	          return "translate("+ (barWidth+ margin) + ","+ top +")"; })
	        .attr("width", 2)
	        .attr("height", 6);

			var radius = d3.scale.sqrt()  
				.domain([0, 1000])
				.range([(2), (width / 45)]); 

			// create the legend
			legend.append("circle")

	    legend.append("text")
	      .attr("dy", "1.3em")
	      .text(d3.format(".1s"));

	    // legend.append("text")
	    //     .text("Btu")
	    //     .attr("transform", "translate(" + (width - (radius2(10000) + 10)) + "," + (height - 10) + ")");      			

			var lgspot = [(path.centroid(TheData[29])[0] + (width / 7)),(path.centroid(TheData[29])[1] + (width / 20))] //using louisiana as reference

			legend        
				// .attr("transform", "translate(" + (width - (radius(10000) + 10)) + "," + (height + 30) + ")");
				.attr("transform", function(d) { 
	        return "translate(" + lgspot + ")"; });

	    legend.selectAll("circle")
	    	.attr("class","lg")
	      .attr("cy", function(d) { return -radius(d); })
	      .attr("r", radius);

	    legend.selectAll("text")
	    	.attr("class","lg")
	      .attr("y", function(d) { return -2 * radius(d); }); 

	    // resize paths of states
			svg.selectAll('path.state')
	    	.attr("d", path);

	  	svg.selectAll('path.state-boundary')
	  		.attr("d", path);
			
			//define here instead of there because if global resets it to 0 automatically which is NOT good :)
			var type = typeArray[k][i]  // where to start
			var R = 1;

			BuildBubbles(width, type);
		}
		
		// Tooltips section goes here

		function BuildBubbles(w, type) {		

			// console.log("i: " + i)
			// console.log("type: " + type)	
			d3.selectAll(".sly").remove();

			// redifine the radius of circles
			var radius = d3.scale.sqrt()  
				.domain([0, 1000])
				.range([(2), (w / 45)]); 

			// load offshore data, and below do the circle creation but with lat/long instead of a centroid-from-topo

			var gulf = [(path.centroid(TheData[28])[0] - 30),(path.centroid(TheData[28])[1] + (w / 10))] //using louisiana as reference
			var pac = [(path.centroid(TheData[8])[0] - (w / 20)),(path.centroid(TheData[8])[1] + (w / 10))]	//using california as reference

			svg.selectAll(".gu").data([]).exit().remove();			

// create the gulf coast div
			bubblediv.append("circle")
				.attr("class", "posB bubble gu")
	      .attr("transform", function(d) { 
	        return "translate(" + gulf + ")"; })
	      .attr("r", function(d) { 		
					var raw = offshore[0][type] / 1000;
	        return radius(raw)
	      })
	      .attr("text", function(d){ return offshore[0]["name"]});				

	    bubblediv.append("circle")
				.attr("class", "posB bubble gu")
	      .attr("transform", function(d) { 
	        return "translate(" + pac + ")"; })
	      .attr("r", function(d) { 		
	      	var raw = offshore[1][type] / 1000;
	      	return radius(raw)
	      	// return i * 10
	      })
	      .attr("text", function(d){ return offshore[1]["name"]});	



		// This is a loop
			svg.selectAll("circle.bubble")
	  		.data(topojson.feature(us, us.objects.us_10m).features		
	        .sort(function(a, b) {        
	        	return b.properties.total2012 - a.properties.total2012; 
	        }))
	      .attr("transform", function(d) { 
	        return "translate(" + path.centroid(d) + ")"; })
	      .attr("r", function(d) { 		
					var raw = d.properties[type]
	        return radius(raw)
	      })
	      .attr("text", function(d){ return d.properties.id});	
			
			var margin	= w / 20;
			var barWidth = w - margin*2;
			var barPoint = margin + ((barWidth / 19)*i)
			// console.log("barWidth: " + barWidth)			

			// Add the year, 
				
			// svg.append("g")
	  //     .attr("id", "slideBox")
	  //     .attr("class", "sly")
	  //     .append("rect")
	  //     .attr("transform", function() { 
		 //        return "translate("+ (barPoint-22) +",34)"; })
	  //       .attr("width", 45)
	  //       .attr("height", 20);	      

			svg
			// .append("g")
	      .append("path")
	      .attr("d", d3.svg.symbol().type("triangle-up"))
	     	.attr("id", "slideTriangle")
	      .attr("class", "sly")
	      .attr("transform", function() { 
		        return "translate("+ (barPoint + 1) +",24)"; })
	        .attr("width", 45)
	        .attr("height", 20);	      	        
      // .attr("d", d3.svg.symbol().type("triangle-up"))

			svg
	      .append("text")
	      .attr("class","tip-text sly")
	      .text(function(d){
	          return i + 1993         
	      })
	      .attr("transform", function() { 
	        return "translate("+ barPoint +",43)"; });	

		} //end bubbles function

		// begin looping stuff
		var num	= 19 //number of iterations, i.e. years		
		var i = 0; // which year you are on
		var k = 1; // which type of data you are looking at (total vs crude, etc)

		function start() {

			play = setInterval(mechanic,1000);	

		}

		// what to do each iteration
		function mechanic() {
			i += 1;					
				if (i === num) {			
					clearInterval(play);		 
				}		
					
			rebuildLoop(i);

		}

		function rebuildLoop(i) {
			// console.log(i)
			// define this type, then send it in
			var type = typeArray[k][i]
			
			// Wish I didn't have to go to the window EVERY time we build the bubbles. 
			// Wish i could do it on every change of window, set "globally" till next change...but alas.
			var width = parseInt(d3.select("#master_container").style("width"));


			BuildBubbles(width, type)
		}
		
		// initial run
	  resize(); 	    	
	  

	  // start looping
	  start(); 

	  d3.select(window).on('resize', resize); 
	  // d3.selectAll("circle.bubble").on('click', tooltip);


	}); //end offshore.json
}); //end states.json


// var start1 = new Date().getTime()			
			// var elapsed = new Date().getTime() - start1;
			// console.log(elapsed)			