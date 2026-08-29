import { Linkedin } from 'lucide-react';
import { FormError, FormItem, FormLabel } from '@/components/Form';
import Input from '@/components/Input';

const BasicInfoStep = () => {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl text-pycon-dark-blue">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="font-inter font-extrabold text-xs md:text-sm uppercase tracking-[0.14em] text-pycon-teal/60">
          Registration
        </p>
        <h2 className="text-3xl md:text-4xl font-inter font-extrabold text-pycon-orange">
          Basic Information
        </h2>
        <p className="text-pycon-dark-blue/40 text-base md:text-lg font-inter font-normal">
          Tell us a bit about yourself. Fields marked <span className="text-pycon-orange font-semibold">*</span> are required.
        </p>
      </div>

      {/* Name Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-inter font-extrabold uppercase tracking-[0.12em] text-pycon-dark-blue/30">
          Name
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <FormItem name="firstName">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  First Name *
                </FormLabel>
                <Input pyconStyles type="text" placeholder="e.g. Maria" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="lastName">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  Last Name *
                </FormLabel>
                <Input pyconStyles type="text" placeholder="e.g. Santos" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="nickname">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  Nickname *
                </FormLabel>
                <Input pyconStyles type="text" placeholder="What should we call you?" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      </div>

      {/* Identity Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-inter font-extrabold uppercase tracking-[0.12em] text-pycon-dark-blue/30">
          Identity
        </h3>
        <div className="w-full">
          <FormItem name="pronouns">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  Pronouns *
                </FormLabel>
                <Input pyconStyles type="text" placeholder="e.g. she/her, they/them" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      </div>

      {/* Contact Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-inter font-extrabold uppercase tracking-[0.12em] text-pycon-dark-blue/30">
          Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <FormItem name="contactNumber">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  Contact Number *
                </FormLabel>
                <Input pyconStyles type="text" placeholder="+63 912 345 6789" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="organization">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  Affiliation / Organization *
                </FormLabel>
                <Input pyconStyles type="text" placeholder="Where do you work or study?" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <div className="md:col-span-2 w-full">
            <FormItem name="jobTitle">
              {({ field }) => (
                <div className="flex flex-col gap-2 w-full">
                  <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                    Role in Tech *
                  </FormLabel>
                  <Input pyconStyles type="text" placeholder="e.g. Software Engineer, Designer, Student" {...field} />
                  <FormError />
                </div>
              )}
            </FormItem>
          </div>
        </div>
      </div>

      {/* Socials Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-inter font-extrabold uppercase tracking-[0.12em] text-pycon-dark-blue/30">
          Socials <span className="font-normal normal-case text-pycon-dark-blue/20 text-xs md:text-sm tracking-normal">(optional)</span>
        </h3>
        <div className="w-full">
          <FormItem name="linkedInLink">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  <Linkedin className="w-5 h-5 text-pycon-orange opacity-70" />
                  LinkedIn
                </FormLabel>
                <Input pyconStyles type="text" placeholder="linkedin.com/in/username" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
