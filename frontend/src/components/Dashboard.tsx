// gets data /get_logged_dates and uses user chosen date to get data from /get_logged_foods and /get_food_nutrients

import React from 'react';
import Navbar from './Navbar';
import PageLayout from './PageLayout';
import { Link } from 'react-router-dom';

// foods is an array of dictionaries with keys food_name, quantity
// nutrients is a dictionary with keys total_protein, total_fat, total_carbohydrate
// dates is an array of strings

type Food = {
    food_name: string;
    food_quantity: number;
};

type Nutrients = {
    total_protein: string;
    total_fat: string;
    total_carbohydrate: string;
};


export default function Dashboard() {
    const [dates, setDates] = React.useState<string[]>([]);
    const [selectedDate, setSelectedDate] = React.useState('');
    const [foods, setFoods] = React.useState<Food[]>([]);
    const [nutrients, setNutrients] = React.useState<Nutrients[]>();
    const [loadingfoods, setLoadingFoods] = React.useState(false);
    const [loadingdates, setLoadingDates] = React.useState(false);
    const [loadingnuts, setLoadingNuts] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const fetchDates = async () => {
            try {
                setLoadingDates(true);
                const response = await fetch('/get_logged_dates');
                setLoadingDates(false);
                if (response.ok) {
                    const data = await response.json();
                    const arr: string[] = data.dates
                    setDates(arr);
                    setSelectedDate(arr[0]);
                } else {
                    setError('An error occurred while fetching dates');
                }
            } catch (error) {
                setError('An error occurred while fetching dates');
            }
        };

        fetchDates();
    }, []);

    React.useEffect(() => {
        const fetchFoods = async () => {
            if (!selectedDate) {
                return;
            }

            try {
                setLoadingFoods(true);
                const response = await fetch('/get_logged_foods', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ date: selectedDate }),
                });
                setLoadingFoods(false);
                if (response.ok) {
                    const data = await response.json();
                    setFoods(data.logged_foods);
                } else {
                    setError('An error occurred while fetching foods');
                }
            } catch (error) {
                setError('An error occurred while fetching foods');
            }
        };

        fetchFoods();
    }, [selectedDate]);

    React.useEffect(() => {
        const fetchNutrients = async () => {
            if (foods.length === 0) {
                return;
            }

            try {
                setLoadingNuts(true);
                const response = await fetch('/get_food_nutrients', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ date: selectedDate }),
                });
                setLoadingNuts(false);
                if (response.ok) {
                    const data = await response.json();
                    setNutrients(data.food_nutrients);
                } else {
                    setError('An error occurred while fetching nutrients');
                }
            } catch (error) {
                setError('An error occurred while fetching nutrients');
            }
        };

        fetchNutrients();
    }, [foods]);

    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDate(e.target.value);
        setFoods([]);
        setNutrients([]);
    };

    return (
        <>
        <Navbar />
        <PageLayout>
            <div className='flex flex-col gap-5'>
                <div>
                <h1 className='mt-[5px] mb-5'>
                    Dashboard
                </h1>
                <div className='flex flex-row justify-between w-full mb-5'>
                    <h2 className='mb-[5px]'>
                        Logged Dates
                    </h2>
                    <select className='mb-[5px] w-[200px] h-[30px] bg-[#6fcdc6] text-white rounded-md p-1'
                    value={selectedDate} onChange={handleDateChange}>
                        {dates && dates.length && dates.map((date) => (
                            <option className='bg-[#6fcdc6] text-white rounded-md p-1 w-[200px] h-[30px]'
                            key={date} value={date}>
                                {date}
                            </option>
                        ))}
                    </select>
                </div>
                {loadingfoods && <p>Loading...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <h3 className='mb-[5px]'>
                    Logged Foods for {selectedDate}
                </h3>
                <ul className='mb-[5px] list-disc list-inside'
                >
                    {foods && foods.length && foods.map((food) => (
                        <>
                            <li key={food.food_name}>{food.food_name}</li>
                            <div>
                                <li key={food.food_quantity}>Quantity: {food.food_quantity}</li>
                            </div>
                        </>
                    ))}
                </ul>
                <h3 className='mb-[5px]'>
                    Total Nutrients for {selectedDate}
                </h3>
                {loadingnuts && <p>Loading...</p>}
                <ul className='list-disc list-inside'
                >
                    {nutrients && nutrients.length && nutrients.map((nutrient) => (
                        <>
                            <li key={nutrient.total_protein}>Total Protein: {nutrient.total_protein} Grams</li>
                            <li key={nutrient.total_fat}>Total Fat: {nutrient.total_fat} Grams</li>
                            <li key={nutrient.total_carbohydrate}>Total Carbs: {nutrient.total_carbohydrate} Grams</li>
                        </>
                    ))
                    }
                </ul>
                </div>
                <div>
                    <button
                    className='bg-[#6fcdc6] text-white p-2 rounded-md w-[200px] h-[30px] flex flex-col align-center justify-center'
                    >
                        <Link to='/submit-entry'
                        className='no-underline text-white'
                        >
                        Add an Entry!</Link>
                    </button>
                </div>
            </div>
        </PageLayout>
        </>
    );
}