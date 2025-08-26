/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './MultiSelectDropdown.Style.css';

const MultiSelectDropdown = ({
  options,
  selected,
  onChange,
  placeholder,
  valueKey = 'key', // field used as the value
  labelKey = 'label', // field used as the display text
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt[labelKey].toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="multi-select-dropdown">
      <div className="multi-dropdown-header" onClick={toggleDropdown}>
        {selected.length > 0
          ? `${selected.length} selected`
          : placeholder || 'Select...'}
        <span className="multi-dropdown-arrow">{isOpen ? '👆' : '👇'}</span>
      </div>

      {isOpen && (
        <div className="multi-dropdown-menu">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="multi-dropdown-search"
          />
          <ul className="multi-dropdown-list">
            {filteredOptions.map((item) => {
              const value = item[valueKey];
              const label = item[labelKey];
              return (
                <li key={value} className="multi-dropdown-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.includes(value)}
                      onChange={() => handleSelect(value)}
                    />
                    {label}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

MultiSelectDropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  selected: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  valueKey: PropTypes.string,
  labelKey: PropTypes.string,
};

MultiSelectDropdown.defaultProps = {
  placeholder: null,
  valueKey: null,
  labelKey: null,
};

export default MultiSelectDropdown;
