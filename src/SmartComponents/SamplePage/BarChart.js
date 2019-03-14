/* eslint-disable */
import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class BarChart extends Component {

    constructor(props) {
        super(props);
        this.server = process.env.REACT_APP_SERVER_ADDRESS ? process.env.REACT_APP_SERVER_ADDRESS : window.location.host;
        this.protocol = process.env.REACT_APP_SERVER_PROTOCOL ? process.env.REACT_APP_SERVER_PROTOCOL : 'https';
    }

    getApiUrl(name) {
        return this.protocol + '://' + this.server + '/tower_analytics/' + name + '/';
    }

    shouldComponentUpdate() {
        console.log('shouldComponentUpdate');
        return false;
    }

    async componentDidMount() {
        console.log('componentDidMount start');
        console.log(ReactDOM.findDOMNode(this));
        console.log(document.getElementById("#bar-chart-root"));
        await this.drawChart();
        console.log('componentDidMount end');
    }

    async drawChart() {
        const url = this.getApiUrl('data');
        const response = await fetch(url);
        const data = await response.json();
        const totals = data.map(x => x[0] + x[1]);
        const clusters = 25;
        console.log(data);
        console.log(totals);

        const y = d3.scaleLinear()
        .domain([ 0, clusters])
        .range([ 0, 210 ]);

        const chartBottom = this.props.height - 70;
        const chartLeft = 70;

        const parseTime = d3.timeParse('%m/%d');
        const x2 = d3.scaleTime().range([ chartLeft + 40, (data.length - 1) * 70 + chartLeft + 40 ]);
        const y2 = d3.scaleLinear().range([ 210, 0 ]);
        x2.domain(d3.extent(data, function(d) { return parseTime(d[2]); }));
        y2.domain([ 0, clusters])
        y2.nice(5);

        console.log("#" + this.props.id);
        console.log(document.getElementById("#" + this.props.id));
        console.log(d3.select("#" + this.props.id));
        const svg = d3.select("#" + this.props.id)
        .append('svg')
        .attr('width', this.props.width)
        .attr('height', this.props.height)
        .style('margin-left', 100)
        .style('background-color', 'white');
        //.style('border-style', 'solid')
        //.style('border-color', 'blue')
        //.style('border-width', '5px');

        // Add the y Axis
        const svgYAxis = svg.append('g');

        svgYAxis.attr('transform', 'translate(' + chartLeft + ',' + (chartBottom - 210) + ')')
        .call(d3.axisRight(y2)
        .ticks(5)
        .tickSize(this.props.width - chartLeft - 50))
        .selectAll('.domain').attr('stroke', '#d7d7d7');
        svgYAxis.selectAll('.tick text').attr('x', -5).attr('dy', 4).attr('fill', '#393f44').attr('text-anchor', 'end');
        svgYAxis.selectAll('.tick line').attr('stroke', '#d7d7d7');

        const svgChart = svg.append('g');

        const columns = svgChart.selectAll('rect')
        .data(data)
        .enter()
        .append('g')
        .attr('data-failures', (d) => d[0])
        .attr('data-passes', (d) => d[1])
        .attr('data-total', (d) => d[0] + d[1])
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseOver)
        .on('mouseout', handleMouseOut);

        // Green
        columns.append('rect')
        .attr('x', (d, i) => i * 70 + chartLeft + 25)
        .attr('y', (d) => chartBottom - y(clusters * d[0] / (d[0] + d[1])))
        .attr('width', 30)
        .attr('height', (d) => y(clusters * d[0] / (d[0] + d[1])))
        .attr('fill', '#d9534f');

        // Red
        columns.append('rect')
        .attr('x', (d, i) => i * 70 + chartLeft + 25)
        .attr('y', (d) => chartBottom - y(clusters))
        .attr('width', 30)
        .attr('height', (d) => y(clusters - clusters * d[0] / (d[0] + d[1])) - 1)
        .attr('fill', '#5cb85c');

        // Add the x Axis
        const svgXAxis = svg.append('g');
        svgXAxis.attr('transform', 'translate(0,' + chartBottom + ')')
        .call(d3.axisBottom(x2)
        .ticks(data.length)
        .tickFormat(d3.timeFormat('%m/%d')));
        svgXAxis.selectAll('.domain').attr('stroke', '#d7d7d7');
        svgXAxis.selectAll('text').attr('fill', '#393f44');
        svgXAxis.selectAll('line').attr('stroke', '#d7d7d7');

        // text label for the y axis
        svg.append('text')
        .attr('transform', 'translate(30, ' + this.props.height / 2 + ') rotate(-90)')
        .style('text-anchor', 'middle')
        .text('Tower Clusters')
        .attr('fill', '#393f44');

        // text label for the x axis
        svg.append('text')
        .attr('transform', 'translate(' + this.props.width / 2 + ', ' + (this.props.height - 30) + ')')
        .style('text-anchor', 'middle')
        .text('Time: Day')
        .attr('fill', '#393f44');

        // tooltip

        const tooltip = svg.append('g');
        tooltip.attr('id', 'svg-chart-tooltip');
        tooltip.style('opacity', 0);
        tooltip.style('pointer-events', 'none');
        tooltip.attr('transform', 'translate(100, 100)');
        tooltip.append('rect')
        .attr('transform', 'translate(10, -10) rotate(45)')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', '#393f44');
        tooltip.append('rect')
        .attr('x', 10)
        .attr('y', -41)
        .attr('rx', 2)
        .attr('height', 82)
        .attr('width', 135)
        .attr('fill', '#393f44');
        tooltip.append('circle')
        .attr('cx', 26)
        .attr('cy', 0)
        .attr('r', 7)
        .attr('stroke', 'white')
        .attr('fill', 'green');
        tooltip.append('circle')
        .attr('cx', 26)
        .attr('cy', 26)
        .attr('r', 7)
        .attr('stroke', 'white')
        .attr('fill', 'red');
        tooltip.append('text')
        .attr('x', 43)
        .attr('y', 4)
        .attr('font-size', 12)
        .attr('fill', 'white')
        .text('Successful');
        tooltip.append('text')
        .attr('x', 43)
        .attr('y', 28)
        .attr('font-size', 12)
        .attr('fill', 'white')
        .text('Failed');
        tooltip.append('text')
        .attr('fill', 'white')
        .attr('stroke', 'white')
        .attr('x', 24)
        .attr('y', 30)
        .attr('font-size', 12)
        .text('!');
        const jobs = tooltip.append('text')
        .attr('fill', 'white')
        .attr('x', 137)
        .attr('y', -21)
        .attr('font-size', 12)
        .attr('text-anchor', 'end')
        .text('No Jobs');
        const failed = tooltip.append('text')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .attr('x', 122)
        .attr('y', 4)
        .text('0');
        const successful = tooltip.append('text')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .attr('x', 122)
        .attr('y', 28)
        .text('0');
        const date = tooltip.append('text')
        .attr('fill', 'white')
        .attr('stroke', 'white')
        .attr('x', 20)
        .attr('y', -21)
        .attr('font-size', 12)
        .text('Never');

        function handleMouseOver(d) {
            const coordinates = d3.mouse(this);
            const x = coordinates[0] + 5;
            const y = coordinates[1] - 5;

            date.text(d[2]);
            jobs.text('' + this.dataset.total + ' Jobs');
            failed.text('' + this.dataset.failures);
            successful.text('' + this.dataset.passes);
            tooltip.attr('transform', 'translate(' + x + ',' + y + ')');
            tooltip.style('opacity', 1);
            tooltip.interrupt();
        }

        function handleMouseOut() {
            tooltip.transition()
            .delay(15)
            .style('opacity', 0)
            .style('pointer-events', 'none');
        }
        console.log('done');

    }

    render () {
        return <div id={ this.props.id }></div>;
    }
}
BarChart.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    id: PropTypes.string
};

export default BarChart;
