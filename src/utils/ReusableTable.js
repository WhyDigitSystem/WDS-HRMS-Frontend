import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ActionButton from './ActionButton'; // Assuming you have ActionButton component

const ReusableTable = ({ data, errors, headers, onAddRow, onDeleteRow, onChange, validation }) => {
  return (
    <div className="table-responsive">
      <ActionButton title="Add" icon={AddIcon} onClick={() => onAddRow()} />
      <br></br>
      <table className="table table-bordered">
        <thead>
          <tr style={{ backgroundColor: '#673AB7' }}>
            {headers.map((header, index) => (
              <th key={index} className="px-2 py-2 text-white text-center" style={{ width: header.width || 'auto' }}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id}>
              <td className="border px-2 py-2 text-center">
                <ActionButton title="Delete" icon={DeleteIcon} onClick={() => onDeleteRow(row.id)} />
              </td>

              {headers.map((header, headerIndex) => (
                <td key={headerIndex} className="border px-2 py-2">
                  {header.inputType === 'text' ? (
                    <input
                      type="text"
                      value={row[header.field]}
                      onChange={(e) => onChange(e, row.id, header.field, index)}
                      className={errors[index]?.[header.field] ? 'error form-control' : 'form-control'}
                    />
                  ) : header.inputType === 'date' ? (
                    <input
                      type="date"
                      value={row[header.field]}
                      onChange={(e) => onChange(e, row.id, header.field, index)}
                      className={errors[index]?.[header.field] ? 'error form-control' : 'form-control'}
                    />
                  ) : (
                    <div>{row[header.field]}</div>
                  )}
                  {errors[index]?.[header.field] && (
                    <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                      {errors[index][header.field]}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}

          {/* Add a button row for adding new rows */}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;
