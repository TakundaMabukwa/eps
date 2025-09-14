const isInspectedToday = (inspectionDate: string | null) => {
    if (!inspectionDate) return false;

    const inspected = new Date(inspectionDate);
    const today = new Date();

    return (
        inspected.getDate() === today.getDate() &&
        inspected.getMonth() === today.getMonth() &&
        inspected.getFullYear() === today.getFullYear()
    );
};
