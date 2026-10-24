import unittest
from io import BytesIO
from typing import Any, cast

import pandas as pd

from ingestion.load import load_files, sanitize_dataframe


class IngestionTests(unittest.TestCase):
    def test_loads_excel_workbook(self):
        source = pd.DataFrame({'Name': ['Asha', 'Ravi'], 'Score': [88, 74]})
        stream = BytesIO()
        source.to_excel(cast(Any, stream), index=False)
        stream.seek(0)

        result = load_files([('students.xlsx', stream)])

        self.assertEqual(result.to_dict(orient='records'), source.to_dict(orient='records'))

    def test_combines_csv_and_excel_files(self):
        excel = BytesIO()
        pd.DataFrame({'Name': ['Ravi'], 'Score': [74]}).to_excel(cast(Any, excel), index=False)
        excel.seek(0)

        result = load_files([
            ('students.csv', BytesIO(b'Name,Score\nAsha,88\n')),
            ('students.xlsx', excel),
        ])

        self.assertEqual(result.to_dict(orient='records'), [
            {'Name': 'Asha', 'Score': 88},
            {'Name': 'Ravi', 'Score': 74},
        ])

    def test_sanitizes_headers_values_and_empty_records(self):
        result = sanitize_dataframe(pd.DataFrame({
            ' Name ': ['  Asha  ', '   '],
            'Name': ['Ravi', None],
            'Unnamed: 2': [None, None],
        }))

        self.assertEqual(list(result.columns), ['Name', 'Name_2'])
        self.assertEqual(result.to_dict(orient='records'), [{'Name': 'Asha', 'Name_2': 'Ravi'}])


if __name__ == '__main__':
    unittest.main()
