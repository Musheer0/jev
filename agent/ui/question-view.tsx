import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QuestionBlock } from "./response";
import type { ActionHandler } from "./actions";

export function QuestionView({ block, onAction }: { block: QuestionBlock; onAction: ActionHandler }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const answer = (ids: string[]) => { if (!ids.length || done) return; setDone(true); onAction({ type: "answer", questionId: block.id, optionIds: ids }); };
  const pick = (id: string) => {
    if (done) return;
    if (!block.multiple) { setSelected([id]); answer([id]); return; }
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2"><Badge variant="outline">Quick question</Badge>{block.multiple && <span className="text-xs text-muted-foreground">Choose all that apply</span>}</div>
        <CardTitle className="text-base">{block.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {block.options.map((option) => {
            const active = selected.includes(option.id);
            return <Button key={option.id} type="button" size="sm" variant={active ? "default" : "outline"} disabled={done} onClick={() => pick(option.id)}>{option.label}{active && <Check className="ml-2 size-3.5" />}</Button>;
          })}
        </div>
        {block.multiple && <Button size="sm" onClick={() => answer(selected)} disabled={!selected.length || done}>{done ? "Submitted" : "Confirm selection"}</Button>}
        {done && <p className="text-xs text-muted-foreground">Answer submitted</p>}
      </CardContent>
    </Card>
  );
}
