export function HelloWorld() {
  return "Hello World";
}

export default "hello world" as const;

export function Injectable() {
  return (target: unknown, ctx: ClassDecoratorContext) => {
    // eslint-disable-next-line no-console
    console.log("Injectable", target, ctx);
  };
}

@Injectable()
export class TestInjectable {}

export * from "./hello/world";
