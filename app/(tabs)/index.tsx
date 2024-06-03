import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Text, Alert, StyleSheet, View, Button, Dimensions } from "react-native";

function isFirstShift(targetDate: Date, isShiftSwapped: boolean): boolean {
    const startingDate = new Date(2020, 0, 13); // Monday, January 13, 2020
    const startingDay = startingDate.getDay(); // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    const targetDay = targetDate.getDay(); // Convert Sunday (0) to 6, Monday (1) to 0, etc.

    const diffTime = targetDate.getTime() - startingDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor((diffDays + startingDay) / 7);

    return isShiftSwapped !== ((diffWeeks + (targetDay >= startingDay ? 0 : 1)) % 2 === 0);
}

function isItHoliday(date: Date): boolean {
    return holidays.some((holiday) => {
        return (
            holiday.getDate() === date.getDate() &&
            holiday.getMonth() === date.getMonth() &&
            holiday.getFullYear() === date.getFullYear()
        );
    });
}

const yearsRange = (currentYear: number): number[] =>
    Array.from({ length: 16 }, (_, i) => currentYear - 5 + i);

const monthsList = [
    { label: "Styczeń", value: "1" },
    { label: "Luty", value: "2" },
    { label: "Marzec", value: "3" },
    { label: "Kwiecień", value: "4" },
    { label: "Maj", value: "5" },
    { label: "Czerwiec", value: "6" },
    { label: "Lipiec", value: "7" },
    { label: "Sierpień", value: "8" },
    { label: "Wrzesień", value: "9" },
    { label: "Październik", value: "10" },
    { label: "Listopad", value: "11" },
    { label: "Grudzień", value: "12" },
];

const daysOfTheWeek = ["Pn", "Wt", "Sr", "Cz", "Pt", "Sb", "Nd"];

const daysInMonth = (year: number, month: number): number =>
    new Date(year, month, 0).getDate();

const holidays: Date[] = [
    new Date(new Date().getFullYear(), 0, 1), // New Year's Day
    new Date(new Date().getFullYear(), 0, 6), // Epiphany
    new Date(new Date().getFullYear(), 4, 1), // May Day
    new Date(new Date().getFullYear(), 4, 3), // Constitution Day
    new Date(new Date().getFullYear(), 7, 15), // Assumption of Mary
    new Date(new Date().getFullYear(), 10, 1), // All Saints' Day
    new Date(new Date().getFullYear(), 10, 11), // Independence Day
    new Date(new Date().getFullYear(), 11, 25), // Christmas Day
    new Date(new Date().getFullYear(), 11, 26), // Second Day of Christmas
];

enum COLORS {
    MORNING = "#249284",
    AFTERNOON = "#246A92",
    SATURDAY = "#1D756A",
    BLACK = "#000",
    L_GRAY = "#888",
    D_GRAY = "#666",
    SUNDAY_TITLE = "#533",
    SATURDAY_TITLE = "#786b3a",
}

interface DayCellProps {
    cellDate: Date;
    isShiftSwapped: boolean;
}

interface DayHeaderCellProps {
    textValue: string;
}

interface PickerColumnProps {
    label: string;
    selectedValue: string;
    onValueChange: (itemValue: string) => void;
    items: { label: string; value: string }[] | number[];
}

interface CalendarGridProps {
    gridSize: number;
    cellSize: number;
    selectedYear: string;
    selectedMonth: string;
    isShiftSwapped: boolean;
}

interface ColorCodesProps {
    gridSize: number;
    isShiftSwapped: boolean;
}

const EmptyCell: React.FC = () => <View style={[styles.cell, styles.emptyCell]}></View>;

const DayCell: React.FC<DayCellProps> = ({ cellDate, isShiftSwapped }) => {
    const firstShift = isFirstShift(cellDate, isShiftSwapped);
    const isSunday = cellDate.getDay() === 0;
    const isSaturday = cellDate.getDay() === 6;
    const isHoliday = isItHoliday(cellDate);
    const backgroundColor = isHoliday
        ? COLORS.SUNDAY_TITLE
        : isSaturday
        ? firstShift
            ? COLORS.SATURDAY
            : COLORS.D_GRAY
        : isSunday
        ? COLORS.D_GRAY
        : firstShift
        ? COLORS.MORNING
        : COLORS.AFTERNOON;

    return (
        <View style={[styles.cell, { backgroundColor }]}>
            <Text style={styles.cellText}>
                {cellDate.getDate().toString().padStart(2, "0")}
            </Text>
        </View>
    );
};

const DayHeaderCell: React.FC<DayHeaderCellProps> = ({ textValue }) => {
    const backgroundColor =
        textValue === "Nd"
            ? COLORS.SUNDAY_TITLE
            : textValue === "Sb"
            ? COLORS.SATURDAY_TITLE
            : "#555";

    return (
        <View style={[styles.cell, styles.dayHeaderCell, { backgroundColor }]}>
            <Text style={styles.dayHeaderCellText}>{textValue}</Text>
        </View>
    );
};

const PickerColumn: React.FC<PickerColumnProps> = ({
    label,
    selectedValue,
    onValueChange,
    items,
}) => (
    <View style={styles.pickerColumn}>
        <Text style={styles.label}>{label}</Text>
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
        >
            {items.map((item, index) =>
                typeof item === "object" ? (
                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                ) : (
                    <Picker.Item key={index} label={item.toString()} value={item.toString()} />
                )
            )}
        </Picker>
    </View>
);

const CalendarGrid: React.FC<CalendarGridProps> = ({
    gridSize,
    cellSize,
    selectedYear,
    selectedMonth,
    isShiftSwapped,
}) => {
    const firstDay = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1);
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysCount = daysInMonth(Number(selectedYear), Number(selectedMonth));
    return (
        <View style={{ borderWidth: 1, borderColor: "black", marginBottom: 5 }}>
            <View style={[styles.container, { width: gridSize, height: cellSize * 1 }]}>
                <View style={styles.row}>
                    {daysOfTheWeek.map((day, index) => (
                        <DayHeaderCell key={index} textValue={day} />
                    ))}
                </View>
            </View>

            <View style={[styles.container, { width: gridSize, height: cellSize * 6 }]}>
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                    <View style={styles.row} key={rowIndex}>
                        {Array.from({ length: 7 }).map((_, cellIndex) => {
                            const dayNumber = rowIndex * 7 + cellIndex + 1 - firstDayOfWeek;
                            const isValidDay = dayNumber > 0 && dayNumber <= daysCount;
                            return isValidDay ? (
                                <DayCell
                                    key={cellIndex}
                                    cellDate={
                                        new Date(
                                            Number(selectedYear),
                                            Number(selectedMonth) - 1,
                                            dayNumber
                                        )
                                    }
                                    isShiftSwapped={isShiftSwapped}
                                />
                            ) : (
                                <EmptyCell key={cellIndex} />
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
};

const ColorCodes: React.FC<ColorCodesProps> = ({ gridSize, isShiftSwapped }) => (
    <View
        style={[
            styles.colorCodes,
            {
                width: gridSize,
                borderTopColor: "black",
                borderTopWidth: 10,
                borderBottomWidth: 20,
            },
        ]}
    >
        <View
            style={[
                styles.colorCodesCell,
                { backgroundColor: isShiftSwapped ? COLORS.AFTERNOON : COLORS.MORNING },
            ]}
        >
            <Text style={styles.colorCodesCellText}>Ranek</Text>
        </View>
        <View
            style={[styles.colorCodesCell, { backgroundColor: COLORS.SUNDAY_TITLE, flex: 1 }]}
        >
            <Text style={styles.colorCodesCellText}>Święto</Text>
        </View>
        <View
            style={[
                styles.colorCodesCell,
                { backgroundColor: isShiftSwapped ? COLORS.MORNING : COLORS.AFTERNOON },
            ]}
        >
            <Text style={styles.colorCodesCellText}>Popołudnie</Text>
        </View>
    </View>
);

const HomeScreen: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed in JavaScript Date

    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());

    const [isShiftSwapped, setIsValueTrue] = useState(false);

    useEffect(() => {
        // Read the stored value from AsyncStorage
        const getValueFromStorage = async () => {
            try {
                const storedValue = await AsyncStorage.getItem("@MyApp:isShiftSwapped");
                if (storedValue !== null) {
                    setIsValueTrue(storedValue === "true"); // Convert the stored value to boolean
                }
            } catch (error) {
                console.error("Error reading value from AsyncStorage:", error);
            }
        };

        getValueFromStorage();
    }, []); // This effect runs only once when the component mounts

    const toggleValue = async () => {
        try {
            const newValue = !isShiftSwapped;
            setIsValueTrue(newValue);
            // Store the new value in AsyncStorage
            await AsyncStorage.setItem("@MyApp:isShiftSwapped", newValue.toString());
        } catch (error) {
            console.error("Error storing value in AsyncStorage:", error);
        }
    };

    // Handler for year picker
    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    // Handler for month picker
    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
    };

    const { width } = Dimensions.get("window");
    const gridSize = width * 0.9;
    const cellSize = gridSize / 7;

    const handleAlert = () => {
        Alert.alert("Zamienić kolory?", "", [
            { text: "NIE", onPress: () => console.log("Cancel Pressed"), style: "cancel" },
            { text: "TAK", onPress: () => toggleValue() },
        ]);
    };

    return (
        <View style={[styles.mainContainer, { width: width, height: "100%" }]}>
            <View style={styles.pickerContainer}>
                <PickerColumn
                    label="Wybierz rok:"
                    selectedValue={selectedYear}
                    onValueChange={handleYearChange}
                    items={yearsRange(currentYear).map((year) => ({
                        label: year.toString(),
                        value: year.toString(),
                    }))}
                />
                <PickerColumn
                    label="Wybierz miesiąc:"
                    selectedValue={selectedMonth}
                    onValueChange={handleMonthChange}
                    items={monthsList}
                />
            </View>

            <CalendarGrid
                gridSize={gridSize}
                cellSize={cellSize}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                isShiftSwapped={isShiftSwapped}
            />

            <ColorCodes gridSize={gridSize} isShiftSwapped={isShiftSwapped} />

            <Button color={"#555"} onPress={handleAlert} title="Zamień kolory" />
            <Text style={{ color: "aliceblue", marginTop: 5, fontSize: 10 }}>
                {isShiftSwapped && "Kolory zamienione"}
            </Text>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
    },
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        flex: 1,
    },
    cell: {
        flex: 1,
        aspectRatio: 1,
        margin: 0,
        borderColor: "#000",
        borderWidth: 1,
        padding: 2,
    },
    holidayCell: {},
    cellText: {
        fontWeight: "bold",
        color: "aliceblue",
    },
    emptyCell: {
        backgroundColor: "#000",
        borderColor: "#000",
    },
    dayHeaderCell: {
        justifyContent: "center",
        alignItems: "center",
    },
    dayHeaderCellText: {
        fontSize: 25,
        color: "#CCC",
    },
    pickerContainer: {
        width: "90%",
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        alignItems: "center",
    },
    pickerColumn: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: "center",
        color: "aliceblue",
    },
    picker: {
        backgroundColor: "gray",
        width: "100%",
        marginBottom: 20,
    },
    colorCodes: {
        flexDirection: "row",
    },
    colorCodesCell: {
        justifyContent: "center",
        alignItems: "center",
        flex: 2,
        borderColor: "#000",
        borderWidth: 1,
        padding: 10,
    },
    colorCodesCellText: {
        fontWeight: "bold",
        color: "aliceblue",
    },
});
