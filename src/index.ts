import Fusion, { Children, Attribute, AttributeChange, AttributeOut, OnChange, OnEvent, Out, Scope } from "@reapimus/fusion";
import Events from "./events";
import ClassMap from "./classes";

function isInstanceEvent<T extends keyof CreatableInstances>(className: T, key: string | number | symbol): key is keyof InstanceEventNames<Instances[T]> {
    if (typeOf(key) !== "string") {
        return false;
    }
    if (Events[(className as string).lower() as keyof Events] === undefined) {
        return false;
    }
    for (const event of Events[(className as string).lower() as keyof Events]) {
        if ((key as string) === event) {
            return true;
        }
    }
    return false;
}

function createElement<T extends keyof CreatableInstances>(
    tag: T | Function,
    props: JSX.JsxInstance<Instances[T]>,
    ...children: Instance[]
): Instance {
    const scope = props.Scope as Scope<typeof Fusion & unknown>;

    if (props.Scope === undefined) {
        throw "Scope is undefined";
    }
    
    if (typeOf(tag) === "function") {
        let newProps: {[key: string | symbol]: unknown} = {};
        
        for (const [key, value] of pairs(props)) {
            if (key === "Scope") continue;

            newProps[key as string] = value;
        }

        if (children.size() > 0) {
            newProps[Children] = children;
        }

        const [funcName] = debug.info(tag as Callback, "n");
        return ((scope as unknown as {[key: string]: unknown})[funcName as string] as Function)(scope, newProps);
    } else {
        let newProps: {[key: string | symbol]: any} = {};
        
        for (const [key, value] of pairs(props)) {
            if (key === "Scope") continue;
            
            if (key === "Attributes") {
                const attributes = value as {[name: string]: AttributeValue};
                for (const [attributeName, attributeValue] of pairs(attributes)) {
                    newProps[Attribute(attributeName as string)] = attributeValue;
                }
            } else if (key === "AttributeOut") {
                const attributeOut = value as {[name: string]: (value: AttributeValue) => void};
                for (const [attributeName, attributeOutValue] of pairs(attributeOut)) {
                    newProps[AttributeOut(attributeName as string)] = attributeOutValue;
                }
            } else if (key === "OnChange") {
                const onChange = value as {[name: string]: (newValue: AttributeValue) => void};
                for (const [onChangeName, onChangeValue] of pairs(onChange)) {
                    newProps[OnChange(onChangeName as string)] = onChangeValue;
                }
            } else if (key === "OnAttributeChange") {
                const onAttributeChange = value as {[name: string]: (newValue: AttributeValue) => void};
                for (const [onAttributeChangeName, onAttributeChangeValue] of pairs(onAttributeChange)) {
                    newProps[AttributeChange(onAttributeChangeName as string)] = onAttributeChangeValue;
                }
            } else if (key === "Out") {
                const out = value as {[name: string]: (ref: Instance) => void};
                for (const [outName, outValue] of pairs(out)) {
                    newProps[Out(outName as string)] = outValue;
                }
            } else if (isInstanceEvent(tag as keyof CreatableInstances, key as string)) {
                newProps[OnEvent(key as string)] = value;
            } else {
                newProps[key as keyof Instances[T]] = value;
            }

            if (children.size() > 0) {
                newProps[Children] = children;
            }
        }

        return scope.New(ClassMap[tag as keyof ClassMap] as keyof CreatableInstances)(newProps);
    }
}

interface FusionJSX {
    createElement: typeof createElement
}

export = {
    createElement
} as FusionJSX;