import Input from "../../UI/Input";
import Select from "../../UI/Select";
import {
  lawyerRequiredQuestions,
  lawyerQuestionRules,
} from "../../utils/lawyerProfile";

export default function LawyerRequiredFields({ register, errors }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {lawyerRequiredQuestions.map((question) => {
        const props = {
          label: question.label,
          required: true,
          ...register(question.name, lawyerQuestionRules(question)),
          error: errors[question.name]?.message,
        };
        return question.options ? (
          <Select key={question.name} {...props}>
            <option value="">انتخاب کنید</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            key={question.name}
            {...props}
            inputMode={question.numeric ? "numeric" : "text"}
            maxLength={question.max || 2}
          />
        );
      })}
    </div>
  );
}
