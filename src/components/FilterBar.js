import React from "react";

const FilterBar = ({ filters, setFilters }) => (
  <div style={{ marginTop: "12px" }}>
    <input
      type="text"
      placeholder="Module"
      value={filters.module}
      onChange={e => setFilters(f => ({ ...f, module: e.target.value }))}
    />
    <input
      type="text"
      placeholder="Marks"
      value={filters.marks}
      onChange={e => setFilters(f => ({ ...f, marks: e.target.value }))}
    />
  </div>
);

export default FilterBar;
