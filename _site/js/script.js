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
  .range([10, 25]);    
  // .domain([0, 3000])
  // .range([5, 15]);  

var legend = svg.append("g")
  .attr("class", "legend")    
  .selectAll("g")
	.data([500, 2000, 5000])
	.enter().append("g");

// var 80 = 80;              

// load some data
d3.json("js/us_93_02_v1.json", function(error, us) {
	if (error) return console.error(error);

	//build a map outside of resize
	svg.selectAll(".state")
    .data(topojson.feature(us, us.objects.us_10m).features)
    .enter().append("path")
      .attr("class", function(d) {return "state " + d.id; });

	svg.append("path")
    .datum(topojson.mesh(us, us.objects.us_10m, function(a,b) {return a !== b;}))
    .attr("class", "state-boundary");

	svg.append("g")
		.attr("class", "bubbles")
		.selectAll("circle")
			.data(topojson.feature(us, us.objects.us_10m).features)
			.enter().append("circle")
			.attr("class", "posB bubble")   

	// Resize function
	function resize() {
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

		// redifine the radius of circles
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

  	// resize circles
		svg.selectAll("circle.bubble")
  		.data(topojson.feature(us, us.objects.us_10m).features
        .sort(function(a, b) { return b.properties.total2012 - a.properties.total2012; }))
      .attr("transform", function(d) { 
        return "translate(" + path.centroid(d) + ")"; })
      .attr("r", function(d) { 
        // var difference = (d.properties.total - d.properties.consumption)
        // console.log(d.properties.name + ": " + difference);
        // var abs_difference = Math.abs(difference);
        // console.log(abs_difference);
        return radius(d.properties.total2012)
      })
      .attr("text", function(d){ return d.properties.id});
	}

	// create the tooltip
	function tooltip(d) {     
		// grab the width to define breakpoints
		width = parseInt(d3.select("#master_container").style("width"))

		// Remove everything and start over.
    d3.selectAll(".tool").remove();

    // store the data
		var data = d;
    centroid = path.centroid(data);

    // where it hangs based on view size
    if (width > 900) {
      if (centroid[1] < 250) {
        centroid_adjusted = [(centroid[0]-85),(centroid[1]+25)];
      } else {
        centroid_adjusted = [(centroid[0]-85),(centroid[1]-80)];
      };        
    }
    else if (width > 700) {  
      if (centroid[1] < 225) {
        centroid_adjusted = [(centroid[0]-85),(centroid[1]+25)];
      } else {
        centroid_adjusted = [(centroid[0]-85),(centroid[1]-80)];
      };
    }
    else if (width > 480) {
      if (centroid[0] < width / 2) {
        centroid_adjusted = [(width - 175),(5)];        
      } else {
        centroid_adjusted = [(5),(5)];               
      };
    } else {
      if (centroid[0] < 200) {
        centroid_adjusted = [(width - 175),(5)];        
      } else {
        centroid_adjusted = [(5),(5)];               
      };
    };    

    // where it hangs within the tip
    tip_text  = [(centroid_adjusted[0] + 80 + 5),(centroid_adjusted[1] + 20)];
    tip_text2  = [(centroid_adjusted[0] + 80 + 5),(centroid_adjusted[1] + 40)];
    tip_close = [(centroid_adjusted[0] + 80*2),(centroid_adjusted[1]+(15))];

    // build the rectangle
    var tooltipContainer = svg.append("g")
      .attr("id", "tooltip")
      .attr("class", "tool")
      .append("rect")
        // .attr("id", "tooltip")
        .attr("transform", function() { 
          return "translate(" + centroid_adjusted + ")"; })
        .attr("width", (170))
        .attr("height", (50))
        .attr("rx", 6)
        .attr("ry", 6)
  	
  	// tip texts
    svg
      .append("text")
      .attr("class","tip-text tool")
      .text(function(d){
          return data.properties.name;          
      })
      .attr("transform", function() { 
        return "translate(" + tip_text + ")"; });

    svg
      .append("text")
      .attr("class","tip-text2 tool")
      .text(function(d){
          return "Total: " + data.properties.total2012 + " Trillion Btu";
      })
      .attr("transform", function() { 
        return "translate(" + tip_text2 + ")"; });

    svg.append("g")
      .attr("class", "closer tool")
      .attr("transform", function(){
        return "translate(" + tip_close + ")";
      })
        .append("text")
        .attr("class", "tip-text2 tool")
        .text("X").on("click", function(){
        	d3.selectAll(".tool").remove();
        });
	}
   
  d3.select(window).on('resize', resize); 
  d3.selectAll("circle.bubble").on('click', tooltip);
  resize(); 
});


