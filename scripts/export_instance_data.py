import pandas as pd
import json

# 读取Excel文件
df = pd.read_excel('/Users/shijinxin/Downloads/Athena/数智空间/本体相关/528演示/demo演示材料/本体_执行Action前.xlsx', sheet_name=None)

instance_data = {}

# 读取各个数据表
sheets_to_read = ['产品', '物料', '供应商', '客户', '客户订单', '工单', '采购订单', '工作中心', '机台设备', '工艺路线', '工序', '物料清单']
for sheet in sheets_to_read:
    if sheet in df:
        sheet_df = df[sheet]
        sheet_df = sheet_df.dropna(axis=1, how='all')
        data = sheet_df.to_dict('records')
        instance_data[sheet] = data
        print(f'Loaded {len(data)} records from {sheet}')

# 输出为JavaScript文件
output_path = '/Users/shijinxin/qoderwork/20260605_area_decision_v1.0.0/src/data/instanceData.js'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('// 从Excel导入的本体实例数据\n')
    f.write('export const instanceData = ')
    f.write(json.dumps(instance_data, ensure_ascii=False, indent=2))
    f.write(';\n')

print(f'\n数据已导出到: {output_path}')
print(f'总记录数: {sum(len(v) for v in instance_data.values())}')
