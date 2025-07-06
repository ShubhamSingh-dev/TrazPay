import PropTypes from "prop-types";

export const Balance = ({ value }) => {
  return (
    <div className="flex items-baseline mb-6">
      <div className="font-bold text-lg mr-2">Your balance:</div>
      <div className="font-semibold text-xl text-green-600">
        ₹{value ? value.toFixed(2) : "0.00"}
      </div>
    </div>
  );
};

Balance.propTypes = {
  value: PropTypes.number,
};
