
export function removeFromArray(array: any[], arrayItem: any) {
    array.forEach((item, index) => {
        if (item === arrayItem) {
            array.splice(index, 1);
        }
    });
}
