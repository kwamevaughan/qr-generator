import { DateRange } from 'react-date-range';
import { FaCalendarAlt } from 'react-icons/fa';

const DatePicker = ({ dateRange, onDateChange, showDatePicker, setShowDatePicker, datePickerRef }) => {
    const handleDateInputClick = () => {
        setShowDatePicker((prev) => !prev);
    };

    const handleDateChange = (ranges) => {
        const range = ranges.selection;
        onDateChange(range);
    };

    const handleTodayClick = () => {
        const today = new Date();
        const newRange = {
            startDate: new Date(today.setHours(0, 0, 0, 0)), // Start of today
            endDate: new Date(today.setHours(23, 59, 59, 999)), // End of today
            key: 'selection',
        };
        onDateChange(newRange);
    };

    const handleAllTimeClick = () => {
        // Define your all-time range; here we use a very old date
        const allTimeRange = {
            startDate: new Date(0), // Start from Unix epoch (January 1, 1970)
            endDate: new Date(), // End with current date
            key: 'selection',
        };
        onDateChange(allTimeRange);
    };

    return (
        <div ref={datePickerRef} className="relative">
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    readOnly
                    onClick={handleDateInputClick}
                    value={`${dateRange.startDate ? dateRange.startDate.toLocaleDateString() : 'Start Date'} - ${dateRange.endDate ? dateRange.endDate.toLocaleDateString() : 'End Date'}`}
                    className="border rounded px-2 py-1 cursor-pointer"
                />
                <button
                    onClick={handleTodayClick}
                    className="bg-green-500 text-white px-4 py-1 rounded-lg"
                >
                    Today
                </button>
                <button
                    onClick={handleAllTimeClick}
                    className="bg-blue-500 text-white px-4 py-1 rounded-lg"
                >
                    All Time
                </button>
            </div>
            {showDatePicker && (
                <DateRange
                    editableDateInputs={true}
                    onChange={handleDateChange}
                    moveRangeOnFirstSelection={false}
                    ranges={[dateRange]}
                    className="absolute z-10"
                />
            )}
        </div>
    );
};

export default DatePicker;
