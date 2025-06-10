import { Pie } from 'react-chartjs-2';

export default function StatusPieChart({ data, options }) {
  return (
    <div className="w-full h-72">
      <Pie data={data} options={options} />
    </div>
  );
}
