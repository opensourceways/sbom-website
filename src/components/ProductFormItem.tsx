import {
    ElInput,
    ElInputNumber,
    ElOption,
    ElSelect,
} from 'element-plus'
import { defineComponent } from 'vue'


const Input = (form: Record<string, any>, data: Record<string, any>) => (
    <ElInput
        v-model={form.data[data.name]}
        clearable
    >
    </ElInput>
)

const InputNumber = (form: Record<string, any>, data: Record<string, any>) => (
    <ElInputNumber
        v-model={form.data[data.name]}
        controls-position="right"
    />

)

const setLabelValue = (_item: any,) => {
    return {
        label: _item.label,
        value: _item.value,
    }
}
const Select = (form: Record<string, any>, name: string, data: []) => (
    <ElSelect
        v-model={form.data[name]}
        filterable
        clearable
        >

        {data.map((item: any) => {
            return <ElOption {...setLabelValue(item)} />
        })}

    </ElSelect>
)

const setFormItem = (
    form: Record<string, any> | undefined,
    data: Record<string, any> | undefined
) => {
    if (!form) return null
    if (!data) return null

    let valueType = data.valueType;
    let enumValue = "";
    const ENUM_REGEX = /enum\((.*)\)/g
    const enumMatch = ENUM_REGEX.exec(valueType);
    if (enumMatch) {
        valueType = "select";
        enumValue = enumMatch[1]
    }

    switch (valueType) {
        case 'string':
            return Input(form, data)
        case 'number':
            return InputNumber(form, data)
        case 'select':
            return Select(form, data.name, JSON.parse(enumValue))
        default:
            return null
    }
}

export default defineComponent({
    name: 'FormItem',
    props: {
        data: Object,
        formData: Object,
    },
    setup(props) {
        return () => {
            return props.data
                ? setFormItem(props.formData, props.data)
                : null
        }
    },
})
